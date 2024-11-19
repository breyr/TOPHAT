import {useState} from "react";

const useContextMenu = () => {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [menuPos, setMenuPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

    const showMenu = (x: number, y: number) => {
        setMenuPos({ x, y });
        setMenuOpen(true);
    }

    const hideMenu = () => {
        setMenuOpen(false);
    }

    return { menuOpen, menuPos, showMenu, hideMenu };
}

export default useContextMenu;