import InputField from "@/app/components/InputField"
import CustomButton from "@/app/components/Button"
const AddInventoryPage = () => {
  return (
        <div className="flex items-center justify-center min-h-screen p-4">
  {/* Added w-full (for mobile) and md:w-1/2 (for 50% width on desktop) */}
        <form className="w-full md:w-1/2">
            <div className="mb-4">
            <InputField placeholder="Material Name" name="itemName" type="text"/>
            </div>
            <div className="mb-4">
            <InputField placeholder="material Category" name="category" type="text" />
            </div>
            <div className="mb-4">
            <InputField placeholder="material Units" name="units" type="text" />
            </div>
            <div className="mb-4">
            <InputField placeholder="Quantity" name="quantity" type="number" />
            </div>
            <div className="mb-4">
            <InputField placeholder="Unit Price" name="unitPrice" type="number" />
            </div>
            <CustomButton text="Add Inventory Item" className="w-full block" />
        </form>
    </div>
     )
}  

export default AddInventoryPage
