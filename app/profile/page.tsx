"use client";
import React from 'react';
import Image from 'next/image';
import Button from '../components/Button';
import NoDataComponent from '../components/NoDataComponent';
import ProjectCard from '../components/ProjectCard';


 const _projects = [
    { name: "Homeland Heights", status: "In Progress", daysLeft: 120, progress: 40, color: "bg-green-500", badge: 1, logo: 'dark' },
    { name: "Homeland Heights", status: "In Progress", daysLeft: 120, progress: 40, color: "bg-green-500", badge: 1, logo: 'dark' },
    { name: "Homeland Heights", status: "In Progress", daysLeft: 120, progress: 40, color: "bg-green-500", badge: 1, logo: 'dark' },
    { name: "Bugolobi Flats", status: "Closed", daysLeft: 0, progress: 100, color: "bg-red-500", badge: null, logo: 'light' },
  ];

export default function ProfilePage() {



const [projects, setProjects] = React.useState(_projects);


if (projects.length === 0) {
  return (
    <NoDataComponent
      title="No Projects Yet"
      description="You haven't added any projects. Start by creating your first project to manage and track your work effectively."
      buttonLink='/projects/addproject'
      buttonText='Add New'
    />
  )
}  



return (
    <div className="min-h-screen bg-[#F8F9FA]">

      <main className="max-w-6xl mx-auto p-8">
        {/* Title and Action Button */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <Button text="Add New" link="profile/project/add" />
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>
      </main>
    </div>
  );
}