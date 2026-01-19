import { useEffect, useMemo, useState } from "react";

export interface TextItem {
  id: string;
  title: string;
  content: string;
  isPdf?: boolean;
  lastIndex: number;
  createdAt: number;
}

interface UseLibraryResult {
  texts: TextItem[];
  activeText: TextItem | undefined;
  saveToLibrary: (
    title: string,
    content: string,
    isPdf?: boolean,
  ) => Promise<string | undefined>;
  deleteFromLibrary: (id: string) => Promise<void>;
  updateText: (id: string, title: string, content: string) => Promise<void>;
  updateProgress: (id: string, index: number) => Promise<void>;
}

export function useLibrary(currentTextId: string | null): UseLibraryResult {
  const [texts, setTexts] = useState<TextItem[]>([]);

  useEffect(() => {
    const localData: TextItem[] = JSON.parse(
      localStorage.getItem("rr_library") || "[]",
    );
    localData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    setTexts(localData);
  }, []);

  const activeText = useMemo(
    () => texts.find((tx: TextItem) => tx.id === currentTextId),
    [texts, currentTextId],
  );

  const saveToLibrary = async (
    title: string,
    content: string,
    isPdf = false,
  ) => {
    if (!title || !content) return;
    const newId = crypto.randomUUID();
    const newItem: TextItem = {
      id: newId,
      title,
      content,
      isPdf,
      lastIndex: 0,
      createdAt: Date.now(),
    };

    const localData: TextItem[] = JSON.parse(
      localStorage.getItem("rr_library") || "[]",
    );
    const updated = [newItem, ...localData];
    localStorage.setItem("rr_library", JSON.stringify(updated));
    setTexts(updated);
    return newId;
  };

  const deleteFromLibrary = async (id: string) => {
    const localData: TextItem[] = JSON.parse(
      localStorage.getItem("rr_library") || "[]",
    );
    const updated = localData.filter((t) => t.id !== id);
    localStorage.setItem("rr_library", JSON.stringify(updated));
    setTexts(updated);
  };

  const updateText = async (id: string, title: string, content: string) => {
    const localData: TextItem[] = JSON.parse(
      localStorage.getItem("rr_library") || "[]",
    );
    const updated = localData.map((t) =>
      t.id === id
        ? {
            ...t,
            title,
            content,
          }
        : t,
    );
    localStorage.setItem("rr_library", JSON.stringify(updated));
    setTexts(updated);
  };

  const updateProgress = async (id: string, index: number) => {
    if (!id) return;

    const localData: TextItem[] = JSON.parse(
      localStorage.getItem("rr_library") || "[]",
    );
    const updated = localData.map((t) =>
      t.id === id ? { ...t, lastIndex: index } : t,
    );
    localStorage.setItem("rr_library", JSON.stringify(updated));
    setTexts(updated);
  };

  return {
    texts,
    activeText,
    saveToLibrary,
    deleteFromLibrary,
    updateText,
    updateProgress: (id, index) => updateProgress(id, index),
  };
}
