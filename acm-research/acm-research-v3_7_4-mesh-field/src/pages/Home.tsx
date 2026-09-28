import { getPosts } from '@/lib/posts';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Areas from '@/components/Areas';
import Publications from '@/components/Publications';
import ContactBand from '@/components/ContactBand';
import Footer from '@/components/Footer';

export default function Home() {
  const posts = getPosts();
  return (
    <main>
      <Nav />
      <Hero />
      <Areas />
      <Publications posts={posts} />
      <ContactBand />
      <Footer />
    </main>
  );
}
