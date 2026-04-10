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

## Instalação e uso

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

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
