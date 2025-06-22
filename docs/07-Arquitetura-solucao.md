
# Arquitetura da Solução

<span style="color:red">Pré-requisitos: <a href="02-Projeto-interface.md">Projeto de interface</a></span>

Definição de como o software é estruturado em termos dos componentes que fazem parte da solução e do ambiente de hospedagem da aplicação.

![Arquitetura da solução](images/arquitetura-reservou.png)

## Funcionalidades

Esta seção apresenta as funcionalidades desenvolvidas na solução **Reservou**.

### Funcionalidade 1 – Cadastro e Login de Usuários

Permite que clientes criem contas, façam login e tenham acesso a funcionalidades personalizadas.

- **Estrutura de dados:** [Usuários](#estrutura-de-dados--usuários)
- **Instruções de acesso:**
  - Acesse o site e clique em “Cadastrar” ou “Login”;
  - Insira nome, email e senha para criar uma conta;
  - Após login, o cliente é redirecionado ao seu dashboard.
- **Tela da funcionalidade:**
  ![Tela de Login]
  ![image](https://github.com/user-attachments/assets/58ab3320-49cd-49bd-a519-f02a36d74be5)


### Funcionalidade 2 – Visualização e Favoritos de Restaurantes

Permite que o cliente veja a lista de restaurantes disponíveis e marque seus favoritos.

- **Estrutura de dados:** [Restaurantes](#estrutura-de-dados--restaurantes), [Favoritos](#estrutura-de-dados--favoritos)
- **Instruções de acesso:**
  - Após login, o usuário acessa o painel com os restaurantes;
  - Pode clicar em um ícone de favorito para adicionar à sua lista personalizada.
- **Tela da funcionalidade:**
  ![Tela de Restaurantes]
  ![image](https://github.com/user-attachments/assets/145d99c6-c834-4f17-8c13-dfb93b14ba51)


### Funcionalidade 3 – Reserva de Mesas

Clientes podem reservar mesas com data, horário, quantidade de pessoas e estacionamento.

- **Estrutura de dados:** [Reservas](#estrutura-de-dados--reservas), [Mesas](#estrutura-de-dados--mesas), [Calendário](#estrutura-de-dados--calendário)
- **Instruções de acesso:**
  - Acesse a página de reservas;
  - Escolha a data e horário disponíveis;
  - Selecione o número de pessoas e se utilizará estacionamento.
- **Tela da funcionalidade:**
  ![Tela de Reserva]
  ![image](https://github.com/user-attachments/assets/d038cbaa-fee1-461f-8edd-109fe3098fa5)


### Funcionalidade 4 – Painel Administrativo

Os administradores (restaurantes) podem visualizar reservas, gerenciar cardápio e atualizar o perfil.

- **Estrutura de dados:** [Restaurantes](#estrutura-de-dados--restaurantes), [Reservas](#estrutura-de-dados--reservas), [Mesas](#estrutura-de-dados--mesas)
- **Instruções de acesso:**
  - Acesse o painel de login e entre como administrador;
  - Visualize as reservas, edite mesas, cardápio e dados do restaurante.
- **Tela da funcionalidade:**
  ![Painel Administrativo]
  ![image](https://github.com/user-attachments/assets/48cef308-58c6-485f-b672-663be8789257)


## Estruturas de Dados

### Estrutura de dados – Usuários

```json
{
  "usuarios": [
    {
      "id": 1,
      "nome": "João Silva",
      "email": "joao@email.com",
      "senha": "hash_da_senha",
      "fotoPerfil": "img/joao.jpg"
    }
  ]
}
```

### Estrutura de dados – Restaurantes

```json
{
  "restaurantes": [
    {
      "id": 1,
      "nome": "Sabor Mineiro",
      "imageUrl": "img/sabor-mineiro.jpg",
      "endereco": "Rua A, 100",
      "telefone": "(81) 98765-4321",
      "capacidade": 40,
      "categoria": "Churrascaria"
    }
  ]
}
```

### Estrutura de dados – Reservas

```json
{
  "reservas": [
    {
      "id": 1,
      "usuarioId": 1,
      "restauranteId": 1,
      "mesaSelecionada": 10,
      "data": "2025-04-15",
      "horarioMarcado": "20:30",
      "qtdPessoas": 5,
      "estacionamento": true
    }
  ]
}
```

### Estrutura de dados – Mesas

```json
{
  "mesas": [
    {
      "id": 10,
      "restauranteId": 1,
      "capacidade": 5,
      "status": "disponivel"
    }
  ]
}
```

### Estrutura de dados – Calendário

```json
{
  "calendario": {
    "restauranteId": 1,
    "mes": "Abril",
    "ano": 2025,
    "dias": [
      {
        "numero": 15,
        "disponivel": true,
        "diaSemana": "Ter"
      }
    ]
  }
}
```

### Estrutura de dados – Favoritos

```json
{
  "favoritos": [
    {
      "id": 1,
      "usuarioId": 1,
      "restauranteId": 1
    }
  ]
}
```

## Módulos e APIs

**Images**:
- Banco de imagens local (repositório do projeto)

**Fonts:**
- Google Fonts – [https://fonts.google.com/](https://fonts.google.com/)

**Scripts e Frameworks:**
- Bootstrap – [https://getbootstrap.com/](https://getbootstrap.com/)
- JavaScript Puro (Vanilla JS)
- Figma (prototipagem) – [https://www.figma.com/](https://www.figma.com/)

## Hospedagem

A hospedagem do projeto foi realizada localmente para fins de desenvolvimento e teste. O sistema utiliza **JSON Server** como backend simulado e os arquivos HTML, CSS e JavaScript são servidos por um ambiente local (por exemplo, **Live Server** no VSCode).

O protótipo interativo da interface está disponível no Figma:  
🔗 [https://www.figma.com/proto/oHKwPjzG327TDr7BkacMgb/RESERVOU](https://www.figma.com/proto/oHKwPjzG327TDr7BkacMgb/RESERVOU)
