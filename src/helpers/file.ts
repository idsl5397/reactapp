import type { ProcessServerConfigFunction } from "filepond";

const dummyFileProcessHandler: ProcessServerConfigFunction = (_, __, ___, load) => {
    load({ message: "done" });
};

export const fileHelper = {
    dummyFileProcessHandler,
};
