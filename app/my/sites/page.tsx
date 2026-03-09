"use client";
import React, { useEffect } from 'react';
import Button from '../../components/Button';
import NoDataComponent from '../../components/NoDataComponent';
import SiteCard from '../../components/SiteCard';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import LoadingComponent from '@/app/components/LoadingComponent';


export const GET_MY_SITES = gql`
  query GetMySites($userId: ID!) {
  getMySites(userId: $userId) {
    id
    name
    logoUrl
    status
    daysLeft
    progress
    notificationCount
  }
}
`

interface GetMySites {
  getMySites:Site[]
}

export default function Page() {

const {user} = useAppSelector((state:RootState)=>state.authSlice)

console.log(user)

const {data,loading,error} = useQuery<GetMySites>(GET_MY_SITES,{
  variables:{
    userId:user?._id
  }
})

const [sites, setSites] = React.useState<Site[]>([]);


useEffect(()=>{
  console.log(data?.getMySites,'========sssss')
  if(data && data.getMySites){
      setSites(data.getMySites)
  }

  if(error){
     //handle error
     console.log(error,"get sites error")
  }
},[data,error])



if(loading){
  return (
    <LoadingComponent />
  )
}


if (sites.length === 0) {
  return (
    <div className='w-full h-screen flex justify-center items-center'>
    <NoDataComponent
      title="No Sites Yet"
      description="You have not added any site. Start by adding your first site to manage"
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