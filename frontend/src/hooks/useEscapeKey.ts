import { useEffect } from "react";

export function useEscapeKey(callback: () => void) {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                // prevent windows from being unmaximized
                event.preventDefault();
                callback();
            }
        };
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("keydown", handleEsc);
        };
    }, [callback]);
}