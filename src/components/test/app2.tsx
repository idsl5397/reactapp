"use client"
import { useTestStore } from "@/Stores/testStore";

export default function App2() {
    const { form } = useTestStore();

    return (
        <>
            {form.map((item, index) => (
                <div key={index}>
                    <div>{item.name}</div>
                    <div>{item.email}</div>
                    <div>{item.password}</div>
                </div>
            ))}
        </>
    );
}
