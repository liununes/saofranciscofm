import RadioHeader from '@/components/radio/RadioHeader';
import RadioPlayer from '@/components/radio/RadioPlayer';
import ImageSlider from '@/components/radio/ImageSlider';
import RecentSongs from '@/components/radio/RecentSongs';
import NewsSection from '@/components/radio/NewsSection';
import WhatsAppButton from '@/components/radio/WhatsAppButton';
import RadioFooter from '@/components/radio/RadioFooter';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <RadioHeader />
      <RadioPlayer />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Slider Central */}
        <ImageSlider />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NewsSection />
          <RecentSongs />
        </div>
      </main>

      <RadioFooter />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
