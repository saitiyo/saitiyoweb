import SearchInput from "@/app/components/SearchInput"
import CustomButton from "@/app/components/Button"

const InventoryDetailsPage = () => {
  return (
    <div>
        <div className="p-6 flex justify-between">
            <div><h1 className="text-2xl font-bold mb-4">Inventory</h1></div>
            <div><CustomButton text="Add Item" /></div>
        </div>
        <div>
            <SearchInput placeholder="Search inventory..." className="" />
        </div>
    </div>
  )
}
export default InventoryDetailsPage
