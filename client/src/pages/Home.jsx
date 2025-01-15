import dbim from "/dbim.png";

const Home = () => {
  return (
    <div className="font-oswald grid min-h-full place-items-center bg-white py-24 px-8 grid-cols-2 gap-10">
      <div className="text-2xl flex flex-col gap-10 ml-4">
        <p>Welcome to DbIM - Your virtual music museum!</p>
        <p>
          Explore our collection of legendary artists, iconic albums,
          influential record labels, and the timeless songs that have left an
          indelible mark on the world. It's like a musical time capsule, where
          you can explore the rich tapestry of music history in one convenient
          place. Discover the stories behind your favorite tunes, learn about
          the artists who created them, and dive into the history of the music
          industry. Whether you're a music lover or just curious, our
          user-friendly platform makes it easy to explore and enjoy the music
          that shapes our world.
        </p>
        <p>
          Start your journey today and let the melodies you love take you on a
          captivating adventure.
        </p>
      </div>
      <div className="bg-sk-22">
        <img src={dbim} alt="SpaceXplorer" className="max-w-full h-auto" />
      </div>
    </div>
  );
};

export default Home;
