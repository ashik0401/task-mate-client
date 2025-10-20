import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white min-h-screen">
      <div className="md:w-10/12 min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col-reverse md:flex-row  gap-8 items-center justify-center">
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Stay Organized, Achieve More
          </h1>
          <p className="text-md sm:text-lg md:text-xl mb-6">
            Create, track, and complete your tasks effortlessly. Never miss a deadline and keep your productivity high!
          </p>
          <Link href="/tasks/create">
            <button className="bg-white text-green-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition-all cursor-pointer">
              Create Your First Task
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
