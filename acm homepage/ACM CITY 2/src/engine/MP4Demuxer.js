import * as MP4Box from 'mp4box';

/**
 * Robust MP4 demuxer that extracts video track samples and codec extradata (avcC/hvcC)
 * for WebCodecs VideoDecoder.
 */
export class MP4Demuxer {
  constructor(videoUrl, onProgress) {
    this.videoUrl = videoUrl;
    this.onProgress = onProgress || (() => {});
    this.videoTrack = null;
    this.description = null;
    this.samples = [];
    this.keyframeIndices = [];
    this.isReady = false;
  }

  /**
   * Fetches and demuxes the MP4 file.
   * Returns a promise resolving with track info, sample count, and keyframe list.
   */
  load() {
    return new Promise((resolve, reject) => {
      const run = async () => {
        try {
          this.onProgress(0.1);
          const response = await fetch(this.videoUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch video from ${this.videoUrl}: HTTP ${response.status} ${response.statusText}`);
          }

          this.onProgress(0.4);
          const arrayBuffer = await response.arrayBuffer();
          arrayBuffer.fileStart = 0;
          this.onProgress(0.7);

          const mp4boxfile = MP4Box.createFile();

          mp4boxfile.onError = (e) => {
            console.error('[MP4Demuxer] MP4Box error:', e);
            reject(new Error(`MP4 parsing error: ${e?.message || e}`));
          };

          mp4boxfile.onReady = (info) => {
            if (!info.videoTracks || info.videoTracks.length === 0) {
              reject(new Error('No video track found in MP4 file.'));
              return;
            }

            const track = info.videoTracks[0];
            this.videoTrack = {
              id: track.id,
              codec: track.codec,
              width: track.video.width,
              height: track.video.height,
              duration: track.duration,
              timescale: track.timescale,
              nb_samples: track.nb_samples
            };

            // Extract extradata description box (avcC for H.264 / avc1)
            try {
              const trak = mp4boxfile.getTrackById(track.id);
              const entry = trak?.mdia?.minf?.stbl?.stsd?.entries?.[0];
              const box = entry?.avcC || entry?.hvcC || entry?.vpcC || entry?.av1C;
              if (box) {
                const stream = new MP4Box.DataStream(undefined, 0, MP4Box.DataStream.BIG_ENDIAN);
                box.write(stream);
                // Slice off 8-byte box header (4 bytes size + 4 bytes type) to get the raw codec description
                this.description = new Uint8Array(stream.buffer, 8);
              }
            } catch (descErr) {
              console.warn('[MP4Demuxer] Failed to extract extradata description:', descErr);
            }

            // Request extraction for all samples
            mp4boxfile.setExtractionOptions(track.id, null, { nbSamples: track.nb_samples });
            mp4boxfile.start();
          };

          mp4boxfile.onSamples = (trackId, _ref, samples) => {
            if (this.videoTrack && trackId === this.videoTrack.id) {
              for (let i = 0; i < samples.length; i++) {
                const s = samples[i];
                const sampleIndex = this.samples.length;
                if (s.is_sync) {
                  this.keyframeIndices.push(sampleIndex);
                }
                this.samples.push({
                  index: sampleIndex,
                  is_sync: s.is_sync,
                  cts: s.cts,
                  dts: s.dts,
                  duration: s.duration,
                  timescale: s.timescale,
                  size: s.size,
                  data: s.data
                });
              }
            }
          };

          // Append full buffer and flush
          mp4boxfile.appendBuffer(arrayBuffer);
          mp4boxfile.flush();

          this.isReady = true;
          this.onProgress(1.0);

          if (this.samples.length === 0) {
            throw new Error('MP4Demuxer failed to extract any video samples.');
          }

          console.log(`[MP4Demuxer] Successfully demuxed ${this.samples.length} samples. Keyframes:`, this.keyframeIndices);

          resolve({
            track: this.videoTrack,
            description: this.description,
            totalFrames: this.samples.length,
            keyframeIndices: this.keyframeIndices
          });

        } catch (err) {
          console.error('[MP4Demuxer] Load error:', err);
          reject(err);
        }
      };

      run();
    });
  }

  /**
   * Finds the closest keyframe index that is <= targetIndex.
   */
  getPrecedingKeyframe(targetIndex) {
    if (this.keyframeIndices.length === 0) return 0;
    let low = 0;
    let high = this.keyframeIndices.length - 1;
    let best = this.keyframeIndices[0];

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const kf = this.keyframeIndices[mid];
      if (kf <= targetIndex) {
        best = kf;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return best;
  }
}
