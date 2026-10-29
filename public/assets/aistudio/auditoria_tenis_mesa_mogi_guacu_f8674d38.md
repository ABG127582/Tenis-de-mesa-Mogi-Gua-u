# Auditoria do projeto — Tênis de Mesa Mogi Guaçu

**Escopo:** leitura estática do ZIP entregue: aplicação React/TypeScript, Express, SQLite, páginas, serviços de API, modelos de dados e conteúdo inicial.

**Diagnóstico executivo:** o projeto tem uma boa estrutura de produto e uma interface relativamente completa, mas ainda mistura conteúdo demonstrativo, armazenamento local do navegador e dados persistidos no backend. Antes de divulgar como plataforma operacional para atletas, é necessário fechar os bloqueios de segurança, persistência e integridade dos dados.

> **Limite desta auditoria:** o ZIP não inclui `node_modules`, lockfile ou suíte de testes. Portanto, esta é uma auditoria de código e fluxos; não foi possível confirmar o funcionamento por execução ponta a ponta nem fazer uma avaliação jurídica formal da LGPD.

## O que já está bem encaminhado

- A navegação está organizada em áreas úteis: teoria, treino, psicologia esportiva, tática, equipamentos, agenda, avisos, histórias, equipe, chat e privacidade.
- Existe API com Express e modelo de dados SQLite, não é apenas uma interface estática.
- As senhas são derivadas com `scrypt` e a verificação usa comparação resistente a timing.
- Há verificações de função para publicar avisos, gerir eventos e aprovar histórias.
- O histórico de treino no backend separa os registos do atleta e dá ao treinador/admin uma visão ampliada.
- A pesquisa global já existe, incluindo atalho Ctrl+K/Cmd+K. O problema principal não é criar outra busca, mas conectá-la a dados atuais.
- Os formulários e as páginas já oferecem uma boa base visual para evoluir sem refazer tudo do zero.

## Bloqueios antes da publicação pública — P0

### P0.1 — Remover contas e credenciais demonstrativas do modo de produção

As contas iniciais e as senhas correspondentes estão definidas no código do banco de dados e reaparecem preenchidas na janela de login, com seleção rápida de utilizadores. Como uma das contas é de treinador, isso pode permitir que qualquer pessoa que conheça o código entre com privilégios de publicação/moderação quando a base é inicializada.

**Correção:** não criar utilizadores de demonstração em produção; remover credenciais preenchidas e botões de acesso rápido; criar o primeiro administrador por processo de implantação seguro; obrigar troca de senha e invalidar as sessões existentes ao rodar credenciais. Se alguma versão já foi publicada, tratar como credenciais expostas e rodar as senhas imediatamente.

### P0.2 — Trocar o armazenamento de sessão em `localStorage`

O token de sessão é guardado no `localStorage`, acessível a qualquer JavaScript executado na origem. A OWASP recomenda não guardar identificadores de sessão nesse armazenamento e favorece cookies `HttpOnly`, `Secure` e `SameSite`, acompanhados das proteções adequadas contra CSRF. Referência: <https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html>.

**Correção:** migrar para cookie de sessão `HttpOnly; Secure; SameSite`, adicionar proteção CSRF conforme a arquitetura escolhida, política de expiração/renovação e encerramento global de sessões em alterações de credencial.

### P0.3 — Rever a persistência do SQLite conforme o destino de hospedagem

O banco é criado em `data/tm_guacu.db`, num caminho local do projeto. O próprio README aponta a implantação do AI Studio/Cloud Run como cenário. No Cloud Run, o sistema de arquivos do contêiner é temporário e os dados não persistem quando a instância é encerrada; instâncias diferentes também não compartilham automaticamente esse arquivo. Referência oficial: <https://docs.cloud.google.com/run/docs/container-contract?hl=pt-br>.

**Correção:** se o destino for Cloud Run, usar uma base persistente e compartilhada (por exemplo, Cloud SQL/PostgreSQL ou outro serviço gerenciado apropriado) ou projetar uma arquitetura de volume persistente suportada. Não confiar no arquivo SQLite local para guardar sessões, mensagens, presenças e consentimentos de produção.

### P0.4 — Corrigir a governança de dados pessoais e de menores

O formulário coleta CPF do responsável legal, e a API grava o valor enviado sem validação de formato, sem prova de que o responsável é efetivamente a pessoa que está consentindo e sem exigir que o campo de aceite seja enviado ao servidor. O campo `agreedTerms` é controlado pela interface, mas não faz parte do payload de registo. A rota de consentimento aceita requisições sem autenticação e não valida campos essenciais no servidor. O CPF é persistido em texto no SQLite.

**Correção:** fazer uma avaliação de necessidade para cada campo; não recolher CPF se não for essencial à finalidade; validar no servidor; guardar a versão exata do texto aceito, finalidade, titular/responsável, data, evidência do ato de aceite e vínculo ao atleta quando aplicável; definir quem pode consultar os dados, prazo de retenção, exportação, retificação e eliminação. Para menores, documentar o fluxo de responsável e a finalidade em seu melhor interesse. Isto precisa de revisão por profissional competente em proteção de dados; a interface, isoladamente, não garante conformidade. Referência ANPD: <https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/copy_of_guia_legitimo_interesse.pdf>.

### P0.5 — Separar dados demonstrativos dos dados oficiais

Há dados `INITIAL_*` em `mockData.ts` e dados iniciais inseridos diretamente no SQLite. A página inicial usa arrays estáticos para eventos, avisos, treinos, histórias e atletas. A saudação é fixa e o filtro de aniversários considera meses fixos. Isso pode fazer conteúdo de exemplo parecer notícia oficial, inclusive após a API já ter dados atualizados.

**Correção:** implementar um modo demonstração explícito, desativado por padrão em produção. Todo conteúdo fictício deve receber rótulo visível e nunca ser inserido na base produtiva. A página inicial deve consultar a API e apresentar estados reais de carregamento, erro e lista vazia.

## Falhas funcionais confirmadas — P1

### P1.1 — Corrigir mensagens de sucesso que não correspondem ao resultado

- No treino, quando a gravação no servidor falha, a interface informa que a sessão foi salva localmente, mas não faz essa gravação local.
- No chat, se a gravação de uma denúncia falha, a interface ainda diz que a denúncia foi salva.

**Correção:** usar estado explícito de sucesso/erro; só mostrar sucesso após resposta confirmada; manter os dados no formulário em caso de erro e oferecer repetir envio.

### P1.2 — Fazer o painel inicial usar a mesma fonte de dados da plataforma

`Dashboard.tsx` e `Header.tsx` pesquisam arrays estáticos, enquanto avisos, eventos, histórias e histórico têm endpoints. Portanto, a busca global e os cards podem divergir das páginas de destino.

**Correção:** centralizar a camada de dados; buscar o conteúdo do backend; incluir atualização, filtros e rótulo da data de verificação; se um endpoint retornar um array vazio, mostrar “nenhum registo” em vez de conservar exemplos antigos.

### P1.3 — Finalizar as ações que hoje são apenas simulações

- **Perfis de atletas:** as alterações são guardadas apenas no `localStorage`; não são enviadas ao servidor, não são partilhadas com outros dispositivos e a página não recebe o utilizador autenticado como contexto. Qualquer visitante pode ver o botão “Editar Meus Dados” do perfil de demonstração.
- **Diário psicológico:** o conteúdo fica numa única chave de `localStorage`, não isolada por conta; num dispositivo partilhado, reflexões podem ficar visíveis a outra pessoa.
- **Ficha de observação tática:** “Registrar Ficha” apenas mostra uma confirmação temporária; não grava nem permite recuperar/exportar a ficha.
- **Equipamentos, biblioteca e links:** o conteúdo é estático, sem fluxo editorial para revisão e atualização.

**Correção:** criar API e tabelas apenas para as ferramentas que serão usadas de verdade; associar cada registo ao utilizador; estabelecer permissões e exportação; remover mensagens que afirmem que um dado foi persistido quando isso não aconteceu.

### P1.4 — Construir a moderação que a interface promete

Existe gravação de denúncias, mas não foi encontrada rota para listar/rever/fechar denúncias nem uma tela de moderação. A mensagem de chat afirma que conteúdo inadequado é removido, mas não há um fluxo completo para moderadores consultar denúncias, remover mensagens e registar a decisão.

**Correção:** criar uma área restrita a moderador/treinador/admin para fila de denúncias, mensagem e contexto, prioridade, decisão, motivo, data e responsável. Adicionar ações de ocultar/remover mensagem, arquivar denúncia e trilha de auditoria. Aplicar as permissões no servidor, não só na interface.

### P1.5 — Tornar o chat realmente atualizado entre utilizadores

A tela carrega as mensagens na montagem e atualiza a lista ao enviar uma mensagem própria. Não há polling, Server-Sent Events ou WebSocket para receber mensagens de outras pessoas enquanto a tela fica aberta.

**Correção:** implementar polling moderado inicialmente ou SSE/WebSocket quando houver necessidade; filtrar mensagens por canal no endpoint; definir limites de retenção e paginação; criar testes para os canais de publicação restrita.

### P1.6 — Confirmar a integração de IA anunciada no projeto

O projeto declara a capacidade `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`, inclui `@google/genai` e instrui a configurar `GEMINI_API_KEY`, mas não foi encontrado uso de `@google/genai`, da variável de ambiente nem chamadas de geração no código-fonte entregue. O montador de treino atual compõe uma rotina com regras locais, sem integração visível ao Gemini.

**Correção:** ou implementar um serviço de IA de verdade no backend, com validação, limites de custo, tratamento de falhas e revisão técnica do conteúdo, ou retirar a declaração/instrução para não sugerir uma capacidade que ainda não existe. Eu priorizaria um gerador por regras transparentes antes de IA livre.

### P1.7 — Revisar o catálogo de regras oficiais

A estrutura local contém 15 secções, numeradas `2.01` a `2.15`; não contém as regras do capítulo 3, embora a referência de origem descreva os capítulos 2 e 3. O documento oficial consolidado de 2026 separa as Leis do Jogo no capítulo 2 e os regulamentos de competições internacionais no capítulo 3.

**Correção:** indicar claramente o escopo (“Leis do Jogo” versus “Regulamentos de Competição”), conferir cada tradução com a edição vigente, mostrar edição/data da fonte e apontar diretamente à regra correspondente. Não rotular o módulo como regulamento completo enquanto o capítulo 3 não estiver incluído. Referência ITTF 2026: <https://db.ittf.com/document/389>.

## Ferramentas novas que mais agregariam valor

A sequência recomendada é deliberada: consolidar os dados primeiro; depois construir as ferramentas abaixo usando esses dados.

### 1. Painel da Comissão Técnica

Um único lugar para gerir eventos, presenças, avisos, atletas, perfis, histórias enviadas, denúncias e permissões. Deve incluir filtros, estados, histórico de alterações, exportação CSV e acesso restrito. Esta é a ferramenta que mais reduz a dependência de editar o código para administrar a equipa.

### 2. Plano de Treino Semanal do Atleta

O treinador define objetivo da semana, sessões, exercícios, duração, séries, foco técnico e recuperação. O atleta marca o que fez; o sistema compara planeado versus concluído e mostra continuidade semanal. Deve reaproveitar o catálogo e o histórico de treinos existentes em vez de criar uma segunda lista desconectada.

### 3. Diário de Partidas e Análise Pós-Jogo

Registar adversário, empunhadura, borrachas/pinos, resultado, padrões de saque e recepção, erros recorrentes, bolas ganhas/perdidas, plano tático e o foco para o próximo treino. A ficha de observação tática atual é o primeiro formulário desta ferramenta e precisa ser persistida.

### 4. Treinador de Saque e Recepção

Criar planos práticos por intenção tática: curto/longo, lateral, para o corpo, variação de profundidade, disfarce e resposta do recebedor. Cada exercício deve dizer objetivo, quantidade, critério de sucesso, erro comum e progressão. Evitar prometer que a IA “lê o efeito” sem dados ou evidência; começar com uma biblioteca estruturada e regras transparentes.

### 5. Modo Mesa / Placar de Partida

Placar grande para celular ou tablet, contagem, troca de saque, alternância de lado, tempos e registo do resultado. Incluir modo treino e modo competição, com confirmação de ações para evitar cliques acidentais. As regras devem ser referenciadas à edição oficial vigente.

### 6. Ficha de Material do Atleta

Registar madeira, borracha de forehand/backhand, espessura, tipo de pino, peso aproximado, data de montagem, custo e observações. Adicionar comparação por estilo de jogo e manutenção, mas separar claramente especificações do fabricante, opinião e experiência pessoal.

### 7. Calendário confiável com logística

Cadastro/edição de evento por treinador, fonte oficial, link, cidade/local, data e prazo de inscrição, “última verificação”, responsável pela atualização, presença/necessidade de transporte e exportação da lista da delegação. Eventos passados devem sair da lista de próximos; eventos sem verificação devem ficar marcados como não confirmados.

### 8. Biblioteca de regras com árvore de decisão

Além da pesquisa existente, permitir perguntas como “a bola tocou no dedo e depois na mesa: ponto ou não?”, apresentar resposta resumida, referência oficial, exceções e uma explicação visual. Cada resposta deve ter versão da regra, fontes e data de revisão. A ferramenta não substitui árbitro em situação real.

### 9. Notificações úteis

A campainha atual apenas abre os avisos e tem um ponto visual fixo. Evoluir para notificações reais: novo evento, alteração de horário, prazo de confirmação, aviso urgente e resposta a uma história/denúncia, sempre com preferências por utilizador.

## Plano de implementação para o desenvolvedor

### Fase A — Bloqueios de publicação

- [ ] Remover contas/senhas demonstrativas de produção e criar bootstrap seguro do administrador.
- [ ] Migrar tokens de `localStorage` para sessão segura em cookie e proteger endpoints adequadamente.
- [ ] Confirmar a arquitetura de banco do destino; não usar SQLite local efémero para dados de produção em Cloud Run.
- [ ] Desativar a inserção de avisos/eventos/atletas fictícios na base produtiva.
- [ ] Rever coleta de CPF, aceite, proteção de menores, retenção, acesso, exportação e eliminação dos dados.
- [ ] Adicionar validação de payload no servidor, limites de tamanho por campo e validação de URLs/datas/enumerações.
- [ ] Aplicar rate limit de forma consistente aos endpoints sensíveis; configurar limpeza/limite de memória e comportamento correto atrás de proxy.

### Fase B — Confiabilidade e fonte única de dados

- [ ] Criar camada de serviços única para todos os módulos e retirar `INITIAL_*` das telas de operação.
- [ ] Distinguir carregamento, erro, sem dados e sucesso em todas as páginas que usam API.
- [ ] Fazer o dashboard e a busca global refletirem os mesmos dados das páginas de destino.
- [ ] Corrigir os falsos estados de sucesso no treino e na denúncia.
- [ ] Criar API de perfil e persistência por utilizador para perfil, diário psicológico e ficha de scouting.
- [ ] Implementar painel de moderação com consulta e resolução de denúncias, remoção de mensagens e auditoria.
- [ ] Implementar atualização do chat entre utilizadores.
- [ ] Documentar os endpoints e as regras de permissões por papel.

### Fase C — Ferramentas esportivas

- [ ] Plano de treino semanal que reaproveita catálogo e histórico.
- [ ] Diário de partidas com estatísticas simples e foco do treino seguinte.
- [ ] Persistência, edição, histórico e exportação da ficha de scouting.
- [ ] Ferramenta de saque/recepção por padrões e critérios de sucesso.
- [ ] Placar de mesa responsivo.
- [ ] Gestão da ficha de equipamento por atleta.
- [ ] Gestão confiável da agenda e logística da delegação.
- [ ] Revisão editorial do regulamento e árvore de decisões da biblioteca.

### Fase D — Qualidade e manutenção

- [ ] Criar testes de API para login, funções, isolamento de dados e autorização por papel.
- [ ] Criar testes de interface para carregamento, listas vazias, erros, mobile e formulários.
- [ ] Adicionar CI para compilação, testes e verificação de dependências.
- [ ] Incluir lockfile e versão de Node suportada.
- [ ] Melhorar acessibilidade: substituir cartões clicáveis construídos como `div` por botões/links semânticos, gerir foco/tecla Esc nos modais e garantir nomes acessíveis.
- [ ] Trocar badges e contadores hardcoded por números derivados de dados reais.
- [ ] Fazer o sino de notificações exibir notificações reais; hoje o ponto de alerta é fixo e o sino apenas abre o quadro de avisos.
- [ ] Rever textos fixos de identidade, aniversários, datas e métricas do perfil.
- [ ] Adicionar política de backup/restauro, retenção e procedimento de resposta a incidente.

## Critérios mínimos de aceite

1. Em produção, nenhuma conta demonstrativa consegue entrar; só o administrador inicializado por processo seguro pode gerir a plataforma.
2. Reiniciar ou escalar a aplicação não apaga mensagens, presenças, histórico nem consentimentos.
3. Um atleta não consegue ler/alterar o diário, perfil ou histórico privado de outro atleta.
4. Uma falha de rede nunca gera mensagem de sucesso; os formulários permitem tentar novamente sem perder os dados.
5. Se a API retorna zero eventos/avisos, a interface mostra estado vazio em vez de conteúdo fictício.
6. A tela de moderação permite consultar e resolver as denúncias, com registo da decisão.
7. Busca e dashboard exibem os mesmos dados atuais que as páginas de origem.
8. Todo conteúdo oficial de regras informa fonte, edição, data de revisão e escopo.
9. Os fluxos de menores e consentimento passam por validação no servidor e revisão de privacidade antes de uso real.
10. A compilação e os testes automatizados passam num ambiente limpo a partir do lockfile.

## Recomendação final

**Não expandir ainda para muitas ferramentas de IA.** Primeiro tornar confiáveis autenticação, armazenamento, perfis, histórico e moderação. A seguir, construir o Plano de Treino Semanal e o Diário de Partidas; essas duas ferramentas podem unir teoria, exercícios, psicologia e tática num ciclo de melhoria real e mensurável. Só depois faz sentido decidir se geração por IA acrescenta valor, com conteúdo revisado, fontes e limites claros.
