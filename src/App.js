/*
Client-only Chatbot React component (single-file)
Drop this file into a React project (e.g. create-react-app) as src/App.jsx
It requires React 17+ (hooks). No server, no API keys — all logic runs in the browser.

Features:
- Minimal, responsive chat UI
- Messages persisted in localStorage
- Simple rule-based intent matcher + fallback responses
- Typing indicator with delay (simulates thinking)
- Optional Text-to-Speech (toggle)
- Easy to extend: replace `getBotReply()` with your own logic

How to use:
1. Create a React app: `npx create-react-app my-chatbot`
2. Replace src/App.js / src/App.jsx with this file
3. `npm start`

Customize:
- Edit `knowledgeBase` for deterministic replies
- Hook `onUserMessage` to add game logic / side effects
*/

import React, { useEffect, useRef, useState } from "react";

export default function ChatbotApp() {
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem("chat_messages_v1");
      return raw ? JSON.parse(raw) : [{ from: "bot", text: "Oi sou o Rodrigo, pergunte algo sobre mim" }];
    } catch (e) {
      return [{ from: "bot", text: "Olá, sou o Rodrigo, pergunte algo sobre mim" }];
    }
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const listRef = useRef(null);
  // Simple knowledge base — edit or extend
  const knowledgeBase = [
    {
      patterns: ["olá", "oi", "eae", "opa", "bom dia", "boa tarde", "boa noite", "fala", "fala aí", "fala ai", "fala ae", "salve", "salveee"],
      reply: "Oi",
    },
    {
      patterns: ["quem é você", "seu nome", "quem voce", "como voce se chama", "qual seu nome", "qual é seu nome", "qual e seu nome"],
      reply: "Me chamo Rodrigo",
    },
    {
      patterns: ["onde voce mora", "onde voce vive", "qual seu endereco", "qual seu endereço", "mora onde", "você mora onde", "voce mora onde"],
      reply: "Moro em uma casa",
    },
    {
      patterns: ["pra que time você torce", "qual seu time", "time de futebol", "time de futebol", "time"],
      reply: "Não gosto de futebol",
    },
    {
      patterns: ["o que você faz", "o que voce faz", "qual sua profissão", "qual sua profissao", "trabalho", "qual seu trabalho", "trampo", "qual seu trampo", "o que faz"],
      reply: "Sou vibe coder",
    },
    {
      patterns: ["me mostra um script de spawn", "script de spawn", "spawn script"],
      reply: "Aqui está um exemplo básico de script de spawn:\n\n```lua\n-- Exemplo de script de spawn em Lua\nfunction spawnNPC()\n  local npc = CreateNPC('Guardião', 100, 200, 300) -- Nome e coordenadas\n  npc:setHealth(100)\n  npc:setArmor(50)\n  npc:setWeapon('Espada')\nend\n\nspawnNPC()\n```",
    },
    {
      patterns: ["me mostra um script de teleporte", "script de teleporte", "teleporte script"],
      reply: "Aqui está um exemplo básico de script de teleporte:\n\n```lua\n-- Exemplo de script de teleporte em Lua\nfunction teleportPlayer(player, x, y, z)\n  player:setPosition(x, y, z) -- Define a nova posição do jogador\nend\n\n-- Teleporta o jogador para as coordenadas (500, 600, 700)\nteleportPlayer(currentPlayer, 500, 600, 700)\n```",
    },
    {
      patterns: ["onde trabalhou antes", "trabalhos anteriores", "empregos anteriores", "onde voce trabalhou", "onde você trabalhou"],
      reply: "De marceneiro a operador de empilhadeira, passando por vendedor e até motorista de aplicativo.",
    },
    {
      patterns: ["do que você gosta", "quais seus hobbies", "o que voce gosta de fazer", "hobbies", "gosta de fazer o que", "passatempo", "passatempo favorito"],
      reply: "Jogar videogame, assistir séries ou filmes e jogar videogame.",
    },
    {
      patterns: ["qual é seu sonho", "qual é seu sonho", "qual e seu sonho", "qual e seu sonho", "o que mais deseja na vida", "sonho da vida", "maior sonho"],
      reply: "Ganhar na loteria e me aposentar.",
    },
    {
      patterns: ["gosta de comer o que", "qual sua comida favorita", "comida favorita", "prato favorito", "qual é sua comida favorita", "comida que mais gosta"],
      reply: "Pizza",
    },
    {
      patterns: ["seu filme favorito", "qual seu filme favorito", "filme favorito", "qual é seu filme favorito", "qual e seu filme favorito"],
      reply: "MIB - Homens de Preto",
    },
    {
      patterns: ["serie favorita", "sua serie favorita", "qual sua serie favorita", "qual sua série favorita", "qual é sua serie favorita", "qual é sua série favorita", "qual e sua serie favorita", "qual e sua série favorita"],
      reply: "Rick and Morty",
    },
    {
      patterns: ["Quem é seu melhor amigo", "qual é seu melhor amigo", "melhor amigo", "melhor amiga", "quem é seu melhor amigo", "quem é sua melhor amiga"],
      reply: "Chiquinho",
    },
    {
      patterns: ["Me fala um pouco sobre você", "Fala mais sobre você", "Fala mais sobre voce"],
      reply: "Sou o Rodrigo, gosto de videogames, fico perturbando o ChatGPT o dia todo e quero ser programador um dia.",
    },
    {
      patterns: ["perfil profissional", "profissional", "perfil", "qual seu perfil profissional", "qual é seu perfil profissional", "qual e seu perfil profissional"],
      reply: "Sou reservado, sincero e perfeccionista.",
    },
    {
      patterns: ["quais suas qualidades", "quais são suas qualidades", "quais suas qualidades", "quais sao suas qualidades"],
      reply: "Sou inventivo, sei ouvir e gosto de aprender.",
    },
    {
      patterns: ["quais seus defeitos", "quais são seus defeitos", "quais seus defeitos", "quais sao seus defeitos"],
      reply: "Sou ansioso, introvertido e sincero.",
    },
    {
      patterns: ["o que você busca em um emprego", "o que voce busca em um emprego", "o que busca em um emprego", "o que você procura em um emprego", "o que voce procura em um emprego", "o que busca em um emprego"],
      reply: "Crescimento profissional, aprendizado constante e um bom ambiente de trabalho.",
    },
    {
      patterns: ["quais são seus objetivos profissionais", "quais sao seus objetivos profissionais", "quais seus objetivos profissionais", "quais são seus objetivos profissionais", "quais sao seus objetivos profissionais", "quais seus objetivos profissionais"],
      reply: "Me tornar um desenvolvedor full-stack e contribuir para projetos inovadores.",
    },
    {
      patterns: ["como você lida com desafios no trabalho", "como voce lida com desafios no trabalho", "como lida com desafios no trabalho", "como você lida com desafios no trabalho", "como voce lida com desafios no trabalho", "como lida com desafios no trabalho"],
      reply: "Encaro desafios como oportunidades de crescimento e busco soluções criativas para superá-los.",
    },
    {
      patterns: ["por que deveríamos te contratar", "por que deveriamos te contratar", "por que devemos te contratar", "por que deveríamos contratar você", "por que deveriamos contratar voce", "por que devemos contratar você"],
      reply: "Tenho vontade de aprender e estou sempre disposto a contribuir para o sucesso da equipe.",
    },
    {
      patterns: ["me conte uma piada", "conte uma piada", "uma piada"],
      reply: "Quantos programadores são necessários para trocar uma lâmpada? Nenhum, isso é um problema de hardware!",
    },
    {
      patterns: ["qual é o sentido da vida", "qual e o sentido da vida", "sentido da vida"],
      reply: "42",
    },
    {
      patterns: ["o que é amor", "defina amor", "amor"],
      reply: "Amor é quando você se importa profundamente com o bem-estar e a felicidade de outra pessoa.",
    },
    {
      patterns: ["o que é amizade", "defina amizade", "amizade"],
      reply: "Amizade é fazer um churras com os parças e esquecer o tempo.",
    },
    {
      patterns: ["qual é a sua cor favorita", "qual e a sua cor favorita", "cor favorita"],
      reply: "Verde",
    },
    {
      patterns: ["qual é o seu animal favorito", "qual e o seu animal favorito", "animal favorito"],
      reply: "Cachorro",
    },
    {
      patterns: ["qual é a sua música favorita", "qual e a sua música favorita", "musica favorita"],
      reply: "Another Brick in the Wall - Pink Floyd",
    },
    {
      patterns: ["qual é o seu livro favorito", "qual e o seu livro favorito", "livro favorito"],
      reply: "O Poder do Agora - Eckhart Tolle",
    },
    {
      patterns: ["qual é o seu jogo favorito", "qual e o seu jogo favorito", "jogo favorito"],
      reply: "The Legend of Zelda: Ocarina of Time",
    },
    {
      patterns: ["qual é o seu lugar favorito", "qual e o seu lugar favorito", "lugar favorito"],
      reply: "Praia de Naufragados",
    },
    {
      patterns: ["qual é a sua estação do ano favorita", "qual e a sua estação do ano favorita", "estação do ano favorita"],
      reply: "Inverno",
    },
    {
      patterns: ["qual é o seu esporte favorito", "qual e o seu esporte favorito", "esporte favorito"],
      reply: "Surf",
    },
    {
      patterns: ["qual é o seu superpoder favorito", "qual e o seu superpoder favorito", "superpoder favorito"],
      reply: "Teletransporte",
    },
    {
      patterns: ["qual é o seu herói favorito", "qual e o seu herói favorito", "herói favorito"],
      reply: "Homem-Aranha",
    },
    {
      patterns: ["qual é a sua vilão favorito", "qual e a sua vilão favorito", "vilão favorito"],
      reply: "Coringa",
    },
    {
      patterns: ["qual é o seu filme de animação favorito", "qual e o seu filme de animação favorito", "filme de animação favorito"],
      reply: "WALL-E",
    },
    {
      patterns: ["qual é o seu desenho animado favorito", "qual e o seu desenho animado favorito", "desenho animado favorito"],
      reply: "Futurama",
    },
    {
      patterns: ["qual é o seu aplicativo favorito", "qual e o seu aplicativo favorito", "aplicativo favorito"],
      reply: "Youtube",
    },
    {
      patterns: ["qual é o seu site favorito", "qual e o seu site favorito", "site favorito"],
      reply: "Github",
    },
    {
      patterns: ["qual é o seu sistema operacional favorito", "qual e o seu sistema operacional favorito", "sistema operacional favorito"],
      reply: "Ubuntu",
    },
    {
      patterns: ["qual é o seu navegador favorito", "qual e o seu navegador favorito", "navegador favorito"],
      reply: "Firefox",
    },
    {
      patterns: ["qual é a sua linguagem de programação favorita", "qual e a sua linguagem de programação favorita", "linguagem de programação favorita"],
      reply: "Lua",
    },
    {
      patterns: ["qual é o seu framework favorito", "qual e o seu framework favorito", "framework favorito"],
      reply: "QBCore",
    },
    {
      patterns: ["qual é a sua biblioteca favorita", "qual e a sua biblioteca favorita", "biblioteca favorita"],
      reply: "React",
    },
    {
      patterns: ["qual é o seu banco de dados favorito", "qual e o seu banco de dados favorito", "banco de dados favorito"],
      reply: "MongoDB",
    },
    {
      patterns: ["qual é o seu serviço de nuvem favorito", "qual e o seu serviço de nuvem favorito", "serviço de nuvem favorito"],
      reply: "AWS",
    },
    {
      patterns: ["qual é o seu editor de código favorito", "qual e o seu editor de código favorito", "editor de código favorito"],
      reply: "VSCode",
    },
    {
      patterns: ["qual é o seu jogo online favorito", "qual e o seu jogo online favorito", "jogo online favorito"],
      reply: "Lineage 2",
    },
    {
      patterns: ["qual é o seu jogo mobile favorito", "qual e o seu jogo mobile favorito", "jogo mobile favorito"],
      reply: "Pokemon Go",
    },
    {
      patterns: ["qual é o seu jogo de console favorito", "qual e o seu jogo de console favorito", "jogo de console favorito"],
      reply: "GTA V",
    },
    {
      patterns: ["qual é o seu jogo de PC favorito", "qual e o seu jogo de PC favorito", "jogo de PC favorito"],
      reply: "Dota 2",
    },
    {
      patterns: ["qual é o seu jogo de tabuleiro favorito", "qual e o seu jogo de tabuleiro favorito", "jogo de tabuleiro favorito"],
      reply: "Yu-Gi-Oh!",
    },
    {
      patterns: ["qual é o seu jogo de cartas favorito", "qual e o seu jogo de cartas favorito", "jogo de cartas favorito"],
      reply: "Truco",
    },
    {
      patterns: ["qual é o seu passatempo favorito", "qual e o seu passatempo favorito", "passatempo favorito"],
      reply: "Perturbar o GitHub Copilot",
    },
    {
      patterns: ["qual é o seu lugar dos sonhos", "qual e o seu lugar dos sonhos", "lugar dos sonhos"],
      reply: "Havaí",
    },
    {
      patterns: ["qual é o seu destino de viagem favorito", "qual e o seu destino de viagem favorito", "destino de viagem favorito"],
      reply: "Japão",
    },
    {
      patterns: ["qual é o seu meio de transporte favorito", "qual e o seu meio de transporte favorito", "meio de transporte favorito"],
      reply: "Moto",
    },
    {
      patterns: ["qual é o seu tipo de música favorito", "qual e o seu tipo de música favorito", "tipo de música favorito"],
      reply: "Dark Forest",
    },
    {
      patterns: ["qual é o seu gênero de filme favorito", "qual e o seu gênero de filme favorito", "genero de filme favorito"],
      reply: "Ficção científica",
    },
    {
      patterns: ["qual é o seu gênero de livro favorito", "qual e o seu gênero de livro favorito", "genero de livro favorito"],
      reply: "Ficção científica",
    },
    {
      patterns: ["qual é o seu gênero de jogo favorito", "qual e o seu gênero de jogo favorito", "genero de jogo favorito"],
      reply: "Freeroam",
    },
    {
      patterns: ["qual é o seu gênero de série favorito", "qual e o seu gênero de série favorito", "genero de série favorito"],
      reply: "Animes",
    },  
  ];

  const fallbackReplies = [
    "Sou só um bot simples, pode reformular?",
    "Não tenho certeza sobre isso, pode perguntar outra coisa?",
    "Não estou programado para responder isso ainda.",
    "Tente perguntar de outra forma.",
  ];

  useEffect(() => {
    try { localStorage.setItem("chat_messages_v1", JSON.stringify(messages)); } catch (e) {}
    // auto-scroll
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // enable TTS if previously set
    const storedTts = localStorage.getItem("chat_tts_v1");
    if (storedTts) setTtsEnabled(storedTts === "1");
  }, []);

  useEffect(() => {
    try { localStorage.setItem("chat_tts_v1", ttsEnabled ? "1" : "0"); } catch (e) {}
  }, [ttsEnabled]);

  function normalize(text) {
    return text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9 ]/g, "");
  }

  function matchKnowledge(text) {
    const n = normalize(text);
    for (const item of knowledgeBase) {
      for (const p of item.patterns) {
        if (n.includes(normalize(p))) return item.reply;
      }
    }
    return null;
  }

  function getBotReply(userText) {
    // First try deterministic KB
    const kb = matchKnowledge(userText);
    if (kb) return kb;

    // quick heuristics
    if (/^\d+$/.test(userText.trim())) return "Número detectado — quer que eu faça algo com ele?";
    if (userText.length < 3) return "Manda mais contexto — frases curtas me confundem.";

    // fallback random
    return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
  }

  function speak(text) {
    if (!ttsEnabled) return;
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    speechSynthesis.cancel(); // stop previous
    speechSynthesis.speak(u);
  }

  function pushMessage(msg) {
    setMessages((s) => [...s, msg]);
  }

  function handleSend(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    pushMessage({ from: "user", text });
    setInput("");

    // simulate thinking
    setIsTyping(true);
    const delay = 400 + Math.min(2000, text.length * 30);
    setTimeout(() => {
      const reply = getBotReply(text);
      pushMessage({ from: "bot", text: reply });
      setIsTyping(false);
      speak(reply);
    }, delay);
  }

  function handleClear() {
    setMessages([{ from: "bot", text: "Pronto pra próxima" }]);
    try { localStorage.removeItem("chat_messages_v1"); } catch (e) {}
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={styles.logo}>🤖</div>
            <div>
              <div style={styles.title}>Groove Bot</div>
              <div style={styles.subtitle}>Bot programado por Rodrigo Marafon</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={styles.switchLabel}>
              <input type="checkbox" checked={ttsEnabled} onChange={(e) => setTtsEnabled(e.target.checked)} />
              <span style={{ marginLeft: 8 }}>TTS</span>
            </label>
            <button onClick={handleClear} style={styles.iconBtn} title="Reiniciar conversa">⟲</button>
          </div>
        </header>

        <main style={styles.chatWindow} ref={listRef}>
          {messages.map((m, i) => (
            <div key={i} style={m.from === "bot" ? styles.msgBot : styles.msgUser}>
              <div style={styles.msgBubble}>
                <div style={styles.msgText}>{m.text}</div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={styles.msgBot}>
              <div style={{ ...styles.msgBubble, fontStyle: "italic" }}>Digitando...</div>
            </div>
          )}
        </main>

        <form onSubmit={handleSend} style={styles.inputRow}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite aqui sua mensagem..."
            style={styles.input}
          />
          <button type="submit" style={styles.sendBtn}>Enviar</button>
        </form>

        <footer style={styles.footer}>Chama no WhatsApp <code>41 98409-7415</code> pra pedir o seu bot personalizado.</footer>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg,#0f172a 0%,#071026 100%)",
    padding: 20,
    boxSizing: "border-box",
    fontFamily: "Inter, Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 760,
    height: "80vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(2,6,23,0.6)",
    overflow: "hidden",
  },
  header: {
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "linear-gradient(135deg,#ff7a59,#ffb86b)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 700,
    fontSize: 20,
  },
  title: { fontSize: 16, fontWeight: 700, color: "#e6eef8" },
  subtitle: { fontSize: 12, color: "#9fb0d6" },
  switchLabel: { display: "flex", alignItems: "center", color: "#9fb0d6", fontSize: 13 },
  iconBtn: { background: "transparent", border: "none", color: "#9fb0d6", fontSize: 18, cursor: "pointer" },
  chatWindow: { flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 },
  msgBot: { display: "flex", justifyContent: "flex-start" },
  msgUser: { display: "flex", justifyContent: "flex-end" },
  msgBubble: { maxWidth: "78%", padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.03)", color: "#e6eef8", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)" },
  msgText: { whiteSpace: "pre-wrap", lineHeight: 1.4 },
  inputRow: { padding: 12, display: "flex", gap: 8, borderTop: "1px solid rgba(255,255,255,0.03)" },
  input: { flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)", color: "#e6eef8", outline: "none" },
  sendBtn: { padding: "10px 14px", borderRadius: 10, border: "none", background: "linear-gradient(90deg,#6ee7b7,#3b82f6)", color: "#052d9dff", fontWeight: 700, cursor: "pointer" },
  footer: { padding: 10, fontSize: 12, color: "#9fb0d6", borderTop: "1px solid rgba(255,255,255,0.01)" },
};
