import Image from "next/image";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center gap-3 p-3">
        <div className="relative w-12 h-12 overflow-hidden rounded-full border border-gray-200">
          <Image 
            src="/profile-avatar.jpg" // Replace with your actual image path
            alt="Moses O"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900 leading-tight">Moses O</h1>
          <p className="text-sm text-gray-500">Architect</p>
        </div>
      </header>
      {children}
    </div>
  );
};

export default ProfileLayout;
