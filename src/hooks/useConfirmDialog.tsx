// hooks/useConfirmDialog.tsx
import React, { useState, useCallback, createContext, useContext } from "react";

type ConfirmOptions = {
    message: string;
    title?: string;
    showCancel?: boolean;
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
        setOptions({ showCancel: true, ...options });
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
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] flex flex-col">
                        {/* 標題區 */}
                        <div className="px-6 pt-6 pb-2 border-b">
                            <h3 className="text-lg font-semibold">{options.title || "確認操作"}</h3>
                        </div>

                        {/* 內容區：加滾動 */}
                        <div className="px-6 py-4 overflow-y-auto text-sm text-gray-800 whitespace-pre-wrap"
                             style={{flexGrow: 1}}>
                            {options.message}
                        </div>

                        {/* 按鈕區：固定在底部 */}
                        <div className="px-6 pb-4 pt-2 border-t flex justify-end gap-2 flex-shrink-0">
                            {options.showCancel && (
                                <button className="btn btn-outline" onClick={handleCancel}>取消</button>
                            )}
                            <button className="btn btn-primary" onClick={handleConfirm}>確認</button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmDialogContext.Provider>
    );
};