
# Instruções para Iniciar o Projeto Localmente

Siga os passos abaixo para rodar o projeto em sua máquina local.

## Passo 1: Instalar as dependências

No terminal, na raiz do projeto, execute o seguinte comando para instalar as dependências:

```bash
npm install
```

## Passo 2: Configurar variáveis de ambiente

O projeto usa o `dotenv` para gerenciar variáveis de ambiente. Na raiz do projeto, você encontrará um arquivo chamado `.env.example`. 

- Renomeie esse arquivo para `.env`.
  
```bash
mv .env.example .env
```

- Abra o arquivo `.env` e configure as variáveis de acordo com seu ambiente local (por exemplo, configurações do banco de dados).

## Passo 3: Criar as migrações com o Prisma

Se for a primeira vez que está configurando o banco de dados, execute o comando abaixo para criar a migração inicial com o Prisma:

```bash
npx prisma migrate dev
```

Este comando irá aplicar as migrações e gerar os arquivos necessários.

## Passo 4: Rodar o servidor

Agora, inicie o servidor de desenvolvimento com o comando:

```bash
npm run dev
```

Isso vai rodar o projeto localmente e você poderá acessar a aplicação no seu navegador.

## Passo 5: Confirmar se tudo está funcionando

Verifique se a aplicação está rodando corretamente no endereço fornecido no terminal (geralmente `http://localhost:3000`).

---

Se precisar de ajuda, entre em contato!
