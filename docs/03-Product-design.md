# Product design

<span style="color:red">Pré-requisitos: <a href="02-Product-discovery.md"> Product discovery</a></span>


> ⚠️ **APAGUE ESTA PARTE ANTES DE ENTREGAR SEU TRABALHO**




## Histórias de usuários

Com base na análise das personas, foram identificadas as seguintes histórias de usuários:

|EU COMO... `PERSONA`| QUERO/PRECISO ... `FUNCIONALIDADE` |PARA ... `MOTIVO/  VALOR`                 |
|--------------------|------------------------------------|----------------------------------------|
|Cliente| Reservar uma mesa em um restaurante pelo site|  Garantir meu lugar sem precisar esperar na chegada               |
|Cliente| Receber uma confirmação da minha reserva por e-mail |   Ter certeza de que minha reserva foi feita corretamente              |
| Funcionário| Receber uma confirmação da minha reserva por e-mail |    Me organizar melhor para atender os clientes              | 
| Funcionário| Alterar ou cancelar uma reserva quando solicitado pelo cliente |   Ajustar a disponibilidade de mesas e atender melhor os clientes        | 
 
|Administrador       | Alterar permissões        ⚠️ EXEMPLO ⚠️         | Permitir que possam administrar contas |

|Dono do Restaurante |  Definir a quantidade de mesas disponíveis para reserva no sistema |   Ajustar a disponibilidade de mesas e atender melhor os clientes        |  Evitar reservas excessivas e garantir um bom atendimento | Acessar todas as reservas feitas pelos clientes| Acompanhar a ocupação do restaurante e tomar decisões estratégicas|
 




> ⚠️ **APAGUE ESTA PARTE ANTES DE ENTREGAR SEU TRABALHO**

**Mariana Lopes**  empresária de uma rede de restaurantes, precisa de um sistema escalável que permita gerenciar reservas em várias unidades, fornecendo relatórios detalhados e suporte ágil para tomadas de decisão. 

**Clientes** Os clientes finais esperam uma experiência intuitiva e rápida para efetuar reservas e interagir com recursos adicionais, como pedidos via QR Code, enquanto a equipe operacional e técnica necessita de ferramentas que vinculem pedidos às mesas, otimizem o atendimento e garantam uma gestão robusta do código-fonte com processos de deploy contínuo.

> **Links úteis**:
> - [Histórias de usuários com exemplos e template](https://www.atlassian.com/br/agile/project-management/user-stories)
> - [Como escrever boas histórias de usuário (user stories)](https://medium.com/vertice/como-escrever-boas-users-stories-hist%C3%B3rias-de-usu%C3%A1rios-b29c75043fac)
> - [User stories: requisitos que humanos entendem](https://www.luiztools.com.br/post/user-stories-descricao-de-requisitos-que-humanos-entendem/)
> - [Histórias de usuários: mais exemplos](https://www.reqview.com/doc/user-stories-example.html)
> - [9 common user story mistakes](https://airfocus.com/blog/user-story-mistakes/)


## Proposta de valor



**✳️✳️✳️ APRESENTE O DIAGRAMA DA PROPOSTA DE VALOR PARA CADA PERSONA ✳️✳️✳️**

**PROPOSTA DE VALOR PARA OS CLIENTES**
![Images](images/Proposta%20de%20Valor.png)



> ⚠️ **APAGUE ESTA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> O mapa da proposta de valor é uma ferramenta que auxilia na definição do tipo de produto ou serviço que melhor atende às personas previamente estabelecidas.


> **Links úteis**:
> - [O que é o canvas da proposta de valor e como usar?](https://www.youtube.com/watch?v=Iqb-8Q_eiiA)

## Requisitos

As tabelas a seguir apresentam os requisitos funcionais e não funcionais que detalham o escopo do projeto. Para determinar a prioridade dos requisitos, aplique uma técnica de priorização e detalhe como essa técnica foi aplicada.

### Requisitos funcionais

| ID     | Descrição do Requisito                                   | Prioridade |
| ------ | ---------------------------------------------------------- | ---------- |
| RF-001 | Permitir cadastro de clientes e restaurantes |         ALTA       |
| RF-002 | Implementar sistema de reservas com horários disponíveis. | ALTA     |
| RF-003 | Enviar confirmação de reserva por e-mail.disponíveis. | ALTA     |
| RF-003 | Enviar confirmação de reserva por e-mail.disponíveis. | ALTA   |

### Requisitos não funcionais

| ID      | Descrição do Requisito                                                              | Prioridade |
| ------- | ------------------------------------------------------------------------------------- | ---------- |
| RNF-001 | Interface responsiva para diferentes dispositivos.| MÉDIA     |
| RNF-002 | Banco de dados seguro e escalável.| MÉDIA     |
| RNF-003 |Integração com APIs de mapas para localização dos restaurantes.| BAIXA      |

>

> **Links úteis**:
> - [O que são requisitos funcionais e requisitos não funcionais?](https://codificar.com.br/requisitos-funcionais-nao-funcionais/)
> - [Entenda o que são requisitos de software, a diferença entre requisito funcional e não funcional, e como identificar e documentar cada um deles](https://analisederequisitos.com.br/requisitos-funcionais-e-requisitos-nao-funcionais-o-que-sao/)


## Restrições

Enumere as restrições à sua solução. Lembre-se de que as restrições geralmente limitam a solução candidata.

O projeto está restrito aos itens apresentados na tabela a seguir.

|ID| Restrição                                             |
|--|-------------------------------------------------------|
|001|  O sistema deve ser desenvolvido utilizando HTML, CSS, Bootstrap e JavaScript.| 
|002| O design deve ser responsivo, garantindo uma boa experiência tanto em dispositivosmóveis quanto em desktops.  |