"use client";
import React from 'react';
import { Card, Progress, Button } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

interface InventoryItemProps {
  name: string;
  unit: string;
  total: number;
  billedDate: string;
  delivered: number;
  remaining: number;
  unitPrice: number;
  totalCost: number;
  color: string;
}

const InventoryCard = ({ item }: { item: InventoryItemProps }) => {
  const percentage = (item.delivered / item.total) * 100;

  return (
    <Card className="rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-xs font-semibold" style={{ color: item.color }}>{item.name}</span>
        </div>
        <Button type="text" size="small" icon={<MoreOutlined />} />
      </div>

      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{item.unit}</h3>
          <p className="text-xs text-gray-400">Billed</p>
          <p className="text-xs text-gray-400">Delivered</p>
          <p className="text-xs text-gray-400">Remaining</p>
        </div>
        <div className="text-right">
          <h3 className="text-lg font-bold text-gray-800">{item.total.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 font-medium">{item.billedDate}</p>
          <p className="text-xs text-gray-500 font-medium">{item.delivered.toLocaleString()}</p>
          <p className="text-xs text-gray-500 font-medium">{item.remaining.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-6">
        <Progress 
          percent={percentage} 
          strokeColor={item.color} 
          trailColor="#f0f2f5"
          showInfo={false}
          strokeWidth={10}
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-bold">
          <span>{Math.round(percentage)}%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="border-t border-gray-50 pt-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Unit Price</span>
          <span className="font-bold text-gray-700">${item.unitPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-bold text-gray-800">Total Cost</span>
          <span className="font-bold text-gray-800">${item.totalCost.toLocaleString()}</span>
        </div>
      </div>
    </Card>
  );
};

export default InventoryCard;
