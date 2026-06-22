# Bububu — Sound Spec: Fart Tiers (Reward System)

**Contexto:** O Bububu "caga" um presente que desliza para baixo e pulsa. Quando o usuário toca, recebe uma recompensa. O som de peido ocorre no momento da "cagada" — antes do tap — e sinaliza antecipação sobre o tier de recompensa. O usuário aprende a calibrar expectativa pelo tipo de som.

**Princípio de design:** distinção sutil entre Normal e Bônus; distinção clara entre os dois e o Jackpot. Nenhum som deve ser farmável — o Jackpot é raro o suficiente para que a distinção explícita não vire estratégia de exploit.

---

## Tier 1 — Normal (70% dos casos)

**Função:** confirmar que a palavra foi registrada. Tom neutro, satisfatório, sem excitação excessiva.

| Parâmetro | Valor |
|---|---|
| Duração | 0.6s – 0.9s |
| Tipo | Peido curto, seco, articulado |
| Pitch | Médio (sem agudos nem graves extremos) |
| Textura | Limpo, sem reverb ou eco |
| Dinâmica | Ataque rápido, decaimento curto |
| Variação | 2–3 variações levemente distintas para evitar repetição mecânica |

**Referência de intenção:** o "pfft" discreto de alguém que achou que não ia ser ouvido.

---

## Tier 2 — Bônus de Contexto (20% dos casos)

**Função:** sinalizar "tem mais coisa aqui" antes do reveal de contexto adicional. Mais elaborado que o Normal, mas não dramático.

| Parâmetro | Valor |
|---|---|
| Duração | 1.0s – 1.4s |
| Tipo | Peido com variação de pitch no meio — começa, hesita, conclui |
| Pitch | Médio com queda ou subida no final (uma "nota") |
| Textura | Levemente mais ressonante que o Normal |
| Dinâmica | Ataque médio, sustain breve, decaimento controlado |
| Variação | 2 variações |

**Referência de intenção:** o peido que tem personalidade — não foi planejado, mas aconteceu com charme.

---

## Tier 3 — Jackpot (10% dos casos)

**Função:** recompensa máxima, deve ser imediatamente reconhecível como especial. A criança sabe que ganhou algo antes de ver o quê.

| Parâmetro | Valor |
|---|---|
| Duração | 1.8s – 2.5s |
| Tipo | Peido épico, multi-fase (introdução + clímax + conclusão) |
| Pitch | Começa médio, sobe no clímax, fecha grave |
| Textura | Reverb sutil (sala pequena), não exagerado |
| Dinâmica | Construção progressiva, pico no segundo terço |
| Variação | 1 versão principal + 1 variação levemente diferente |
| Elemento extra | Opcional: nota musical final (tipo "ta-dá" abafado) para reforçar o momento de celebração |

**Referência de intenção:** o peido que a criança vai imitar para os amigos no recreio.

---

## Especificações técnicas gerais

| Parâmetro | Valor |
|---|---|
| Formato de entrega | .mp3 (128kbps) + .wav (44.1kHz, 16bit) |
| Volume normalizado | -12 dBFS (peak), -18 dBFS (RMS) |
| Silêncio no início | ≤ 50ms |
| Silêncio no final | ≤ 200ms |
| Respeito ao modo silencioso | Obrigatório — usar AVAudioSession no iOS, AudioManager no Android |
| Volume padrão do app | 70% do volume do sistema |

---

## Notas de implementação

- Os sons devem ser carregados em memória no boot do app (não streaming) para garantir latência zero no tap.
- No Kids mode, volume máximo deve ser capado a 80% do sistema independente da configuração do usuário.
- A seleção do tier acontece **antes** da animação de cagada — o som e a animação devem ser disparados juntos para sincronia.
- Evitar loops: cada som toca uma vez, completo, sem interrupção pelo próximo input.
