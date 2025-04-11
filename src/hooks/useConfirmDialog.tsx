// hooks/useConfirmDialog.tsx
import React, { useState, useCallback, createContext, useContext } from "react";

type ConfirmOptions = {
    message: string;
    title?: string;
};

type ConfirmDialogContextType = {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export const useConfirmDialog = (): ConfirmDialogContextType => {
    const context = useContext(ConfirmDialogContext);
    if (!context) throw new Error("useConfirmDialog 必須包在 ConfirmDialogProvider 中");
    return context;
};

export const ConfirmDialogProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({ message: "" });
    const [resolveFn, setResolveFn] = useState<(result: boolean) => void>();

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        setOptions(options);
        setIsOpen(true);
        return new Promise<boolean>((resolve) => {
            setResolveFn(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        resolveFn?.(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        resolveFn?.(false);
    };

    return (
        <ConfirmDialogContext.Provider value={{ confirm }}>
            {children}
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-4">{options.title || "確認操作"}</h3>
                        <p className="mb-6">{options.message}</p>
                        <div className="flex justify-end gap-2">
                            <button className="btn btn-outline" onClick={handleCancel}>取消</button>
                            <button className="btn btn-primary" onClick={handleConfirm}>確認</button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmDialogContext.Provider>
    );
};