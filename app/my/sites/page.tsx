"use client";
import React from 'react';
import Button from '../../components/Button';
import NoDataComponent from '../../components/NoDataComponent';
import SiteCard from '../../components/SiteCard';


 const _projects = [
    { name: "Homeland Heights", status: "In Progress", daysLeft: 120, progress: 40, color: "bg-green-500", badge: 1, logo: 'dark' },
    { name: "Homeland Heights", status: "In Progress", daysLeft: 120, progress: 40, color: "bg-green-500", badge: 1, logo: 'dark' },
    { name: "Homeland Heights", status: "In Progress", daysLeft: 120, progress: 40, color: "bg-green-500", badge: 1, logo: 'dark' },
    { name: "Bugolobi Flats", status: "Closed", daysLeft: 0, progress: 100, color: "bg-red-500", badge: null, logo: 'light' },
  ];

export default function ProfilePage() {



const [sites, setSites] = React.useState<Site[]>([]);


if (sites.length === 0) {
  return (
    <div className='w-full h-screen flex justify-center items-center'>
    <NoDataComponent
      title="No Sites Yet"
      description="You haven't added any site. Start by adding your first site to manage and track your work effectively."
      buttonLink="/my/sites/add"
      buttonText='Add New'
    />
    </div>
  )
}  



return (
    <div className="min-h-screen bg-[#F8F9FA]">

      <main className="max-w-6xl mx-auto p-8">
        {/* Title and Action Button */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
          <Button text="Add New" link="/my/sites/add" />
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sites.length > 0 && sites.map((site, index) => (
            <SiteCard key={index} site={site} />
          ))}
        </div>
      </main>
    </div>
  );
}