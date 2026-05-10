import { useEffect, useState } from "react";

export function TypingText({
  words,
  speed = 90,
  pause = 1400,
}: {
  words: string[];
  speed?: number;
  pause?: number;
}) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);

  useEffect(() => {
    const word = words[i % words.length];
    if (!del && text === word) {
      const t = setTimeout(() => setDel(true), pause);
      return () => clearTimeout(t);
    }
    if (del && text === "") {
      setDel(false);
      setI((p) => p + 1);
      return;
    }
    const t = setTimeout(
      () => {
        setText(del ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
      },
      del ? speed / 2 : speed,
    );
    return () => clearTimeout(t);
  }, [text, del, i, words, speed, pause]);

  return <span className="text-gradient typing-cursor whitespace-nowrap">{text}</span>;
}
