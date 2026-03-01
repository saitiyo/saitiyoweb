import InputField from "@/app/components/InputField"
import CustomButton from "@/app/components/Button"
const AddInventoryPage = () => {
  return (
        <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        {/* The form now has a border, rounded corners, padding, and a white background */}
        <form className="w-full md:w-1/2 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Inventory Item</h2>
            
            <div className="mb-4">
            <InputField placeholder="Material Name" name="itemName" type="text"/>
            </div>
            <div className="mb-4">
            <InputField placeholder="Material Category" name="category" type="text" />
            </div>
            <div className="mb-4">
            <InputField placeholder="Material Units" name="units" type="text" />
            </div>
            <div className="mb-4">
            <InputField placeholder="Quantity" name="quantity" type="number" />
            </div>
            <div className="mb-6">
            <InputField placeholder="Unit Price" name="unitPrice" type="number" />
            </div>
            
            <CustomButton text="Add Inventory Item" className="w-full block" />
        </form>
    </div>
     )
}  

export default AddInventoryPage
