# Compressão de Dados

Aplicação web para codificação e decodificação de texto utilizando algoritmos clássicos de compressão de dados.

## Funcionalidades

- Codifica texto simples em sequências de bits usando quatro algoritmos diferentes
- Decodifica sequências de bits de volta ao texto original

## Algoritmos implementados

| Algoritmo | Descrição |
|---|---|
| **Golomb** | Codificação por quociente e resto com parâmetro fixo `m = 4`. Eficiente para valores com distribuição geométrica. |
| **Elias-Gamma** | Codifica inteiros positivos prefixando `k` zeros antes da representação binária, onde `k = ⌊log₂(n)⌋`. |
| **Fibonacci (Zeckendorf)** | Representa cada inteiro como soma de números de Fibonacci não consecutivos, com stop bit `11` ao final de cada palavra. |
| **Huffman** | Árvore de Huffman estática construída com base na frequência esperada das letras do alfabeto ASCII, priorizando letras mais comuns com códigos mais curtos. |

## Como funciona

### Codificação

O texto de entrada é processado caractere a caractere. Cada caractere ASCII é convertido em bits pelo algoritmo selecionado. Em seguida, os bits passam por duas camadas de proteção, nesta ordem:

1. **Hamming(7,4)** — os bits são agrupados em blocos de 4; cada bloco é expandido para 7 bits com 3 bits de paridade. Ao final do frame, são anexados um campo de 2 bits indicando o padding e um **CRC de 4 bits** calculado sobre todo o conteúdo do frame Hamming.
2. **Repetição (×3)** — cada bit do frame resultante é triplicado (`0 → 000`, `1 → 111`).

O resultado final é exibido na interface e pode ser editado manualmente antes do envio (útil para simular erros de transmissão).

### Decodificação (via servidor WebSocket)

O servidor (`server.ts`) recebe os frames pelo WebSocket na porta **4000**. A decodificação desfaz as camadas na ordem inversa à codificação:

1. **Repetição (×3)** — cada grupo de 3 bits é reduzido a 1 bit por votação majoritária (2 ou mais bits iguais determinam o resultado).
2. **CRC + Hamming(7,4)** — o CRC do frame é verificado para detectar erros; cada codeword de 7 bits é decodificado pelo Hamming, corrigindo até 1 erro por bloco; o padding é removido e os bits de dados originais são recuperados.
3. Os bits recuperados são decodificados pelo algoritmo selecionado e o caractere resultante é retornado ao cliente.

O cliente acumula os caracteres e reconstrói o texto original.

## Instalação e execução

Instale as dependências:

```bash
npm install
```

Em dois terminais separados, inicie o servidor WebSocket e o cliente Next.js:

```bash
# Terminal 1 — servidor WebSocket (porta 4000)
npm run server

# Terminal 2 — cliente web (porta 3000)
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador. O indicador colorido na interface mostra o estado da conexão com o servidor (verde = conectado).

## Estrutura do projeto

```
app/
  components/
    Compressor.tsx   # Seletor de algoritmo
    Encoder.tsx      # Formulário de codificação
    Decoder.tsx      # Formulário de decodificação
  page.tsx           # Página principal
lib/
  codecs.ts          # Registro de algoritmos disponíveis
  algorithms/
    golomb.ts        # Implementação Golomb
    elias-gamma.ts   # Implementação Elias-Gamma
    fibonacci.ts     # Implementação Fibonacci/Zeckendorf
    huffman.ts       # Implementação Huffman
    utils.ts         # Utilitários compartilhados
```
