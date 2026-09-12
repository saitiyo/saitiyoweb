"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import InputField from "@/app/components/InputField";
import CustomButton from "@/app/components/Button";
import { GET_INVENTORY_ITEMS } from "../page";

const CREATE_INVENTORY_ITEM = gql`
    mutation CreateInventoryItem($input: CreateItemInput!) {
        createInventoryItem(input: $input) {
                id
                siteId
            name
            price
        }
    }
`;

type InventoryForm = {
    itemName: string;
    category: string;
    units: string;
    quantity: string;
    unitPrice: string;
};

const AddInventoryPage = () => {
    const params = useParams();
    const router = useRouter();
    const siteId = typeof params.id === "string" ? params.id : params.id?.[0];
    const [form, setForm] = useState<InventoryForm>({
        itemName: "",
        category: "",
        units: "",
        quantity: "",
        unitPrice: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [createInventoryItem, { loading }] = useMutation(CREATE_INVENTORY_ITEM, {
        fetchPolicy: "no-cache",
        awaitRefetchQueries: true,
    });

    const updateField = (field: keyof InventoryForm, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");

        if (!siteId) {
            setErrorMessage("A site could not be identified.");
            return;
        }

        try {
            await createInventoryItem({
                variables: {
                    input: {
                        siteId,
                        name: form.itemName.trim(),
                        images: [],
                        itemType: "PRODUCT",
                        description: `Category: ${form.category.trim()} | Unit: ${form.units.trim()}`,
                        stock: Number(form.quantity),
                        price: Number(form.unitPrice),
                        costPrice: Number(form.unitPrice),
                    },
                },
                refetchQueries: [{
                    query: GET_INVENTORY_ITEMS,
                    variables: { siteId },
                }],
            });
            setForm({ itemName: "", category: "", units: "", quantity: "", unitPrice: "" });
            router.push(`/site/${siteId}/inventory`);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Failed to create inventory item.");
        }
    };

  return (
        <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
                <form onSubmit={handleSubmit} className="w-full md:w-1/2 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Inventory Item</h2>
            
            <div className="mb-4">
            <InputField placeholder="Material Name" name="itemName" type="text" value={form.itemName} onChange={(event) => updateField("itemName", event.target.value)} required />
            </div>
            <div className="mb-4">
            <InputField placeholder="Material Category" name="category" type="text" value={form.category} onChange={(event) => updateField("category", event.target.value)} required />
            </div>
            <div className="mb-4">
            <InputField placeholder="Material Units" name="units" type="text" value={form.units} onChange={(event) => updateField("units", event.target.value)} required />
            </div>
            <div className="mb-4">
            <InputField placeholder="Quantity" name="quantity" type="number" value={form.quantity} onChange={(event) => updateField("quantity", event.target.value)} min="0" required />
            </div>
            <div className="mb-6">
            <InputField placeholder="Unit Price" name="unitPrice" type="number" value={form.unitPrice} onChange={(event) => updateField("unitPrice", event.target.value)} min="0" required />
            </div>
            
            {errorMessage && <p role="alert" className="mb-4 text-sm text-red-600">{errorMessage}</p>}
            <CustomButton text={loading ? "Adding..." : "Add Inventory Item"} className="w-full block" htmlType="submit" disabled={loading} />
        </form>
    </div>
     )
}  

export default AddInventoryPage

