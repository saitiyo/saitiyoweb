"use client";
import React from 'react';
import { Card } from 'antd';
import Image from 'next/image';

interface PlanProps {
  name: string;
  thumbnail: string;
  pdfUrl: string;
}

const PlanCard = ({ plan }: { plan: PlanProps }) => {
  return (
    <Card
      hoverable
      className="rounded-xl overflow-hidden shadow-sm border-gray-100"
      cover={
        <div className="relative h-48 w-full bg-gray-50 border-b border-gray-100">
          <Image
            src={plan.thumbnail}
            alt={plan.name}
            fill
            className="object-contain p-2"
          />
        </div>
      }
      onClick={() => window.open(plan.pdfUrl, '_blank')}
    >
      <Card.Meta 
        title={<span className="text-gray-600 font-medium text-center block w-full">{plan.name}</span>} 
      />
    </Card>
  );
};

export default PlanCard;
