"use client";
import React from "react";
import { Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface SearchInputProps {
  /** Placeholder text shown when the input is empty */
  placeholder?: string;
  /** Callback invoked when the user clicks the search button or presses enter */
  onSearch?: (value: string) => void;
  /** Additional Tailwind/utility classes to apply to the wrapper */
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search...",
  onSearch,
  className = "",
}) => {
  return (
    <Input.Search
      placeholder={placeholder}
      onSearch={onSearch}
      enterButton={
        <Button
          style={{ backgroundColor: 'black', borderColor: 'black' }}
          className="text-white"
          icon={<SearchOutlined style={{ color: 'white' }} />}
        />
      }
      className={`w-full max-w-md rounded-lg border-gray-300 shadow-sm focus:border-blue-500 ${className}`}
    />
  );
};

export default SearchInput;
