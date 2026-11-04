# Plataforma profissional de Ordem de Serviço

## Objetivo
Evoluir o app existente sem perder a simplicidade: emissão rápida, dados salvos neste aparelho e documentos profissionais.

## O que será construído
1. **Configurações da empresa:** solicitar no primeiro uso os dados da assistência e a logo; permitir alterações posteriores e preencher os PDFs automaticamente.
2. **Página inicial:** logo, totais de ordens, em andamento, finalizadas e entregues, últimas ordens e botão destacado **+ NOVA O.S.**. Em andamento reúne Recebido, Em análise, Aguardando peça e Em reparo.
3. **Serviços e checklist:** adicionar, editar e excluir itens; serviços com nome, garantia em dias e observação opcional. Preservar os serviços iniciais e as opções atuais do checklist.
4. **Ordens:** preservar os campos atuais, seleção Android/iPhone, descrição de Outro e assinatura; adicionar status, fotos de frente/traseira/adicional com câmera e gravação local. Nova ordem começa como **Recebido**.
5. **Histórico:** busca por número, cliente e telefone; visualizar, editar, mudar status, gerar novamente e compartilhar PDFs. Cada ordem salva permanece disponível após fechar e reabrir o app.
6. **PDF A4:** dados da empresa, ordem, cliente, aparelho, serviço, garantia, valor, checklist, acessórios, observações, miniaturas, termo, QR Code, assinatura do cliente e espaço para assinatura da assistência.
7. **Após gerar:** baixar, compartilhar, criar nova ordem e abrir WhatsApp com a mensagem especificada. O WhatsApp não anexa o PDF automaticamente; o arquivo será enviado pelo compartilhamento ou anexado pelo usuário.
8. **Instalação e offline:** manter a instalação Android/iPhone e revisar o cache para as novas telas. Uso offline depende de publicar e abrir o app uma vez com internet; a prévia não registra o serviço offline.

## Regras e decisões
- Dados ficam neste navegador/aparelho, sem conta ou serviço online nesta etapa. Limpar os dados do navegador remove o histórico; não haverá sincronização entre dispositivos.
- Numeração **OS-AAAAMMDD-XXXX** com verificação de colisões locais antes de salvar.
- `trackingUrl` começa vazio. Sem URL pública, o QR Code identifica o número da ordem, sem prometer consulta online; quando houver URL, o QR Code poderá apontar para ela.
- Salvar ao concluir a ordem e antes de gerar seu PDF; não exigir preenchimento de fotos, IMEI, senha ou assinatura.
- A meta de menos de 60 segundos orienta o formulário; não será apresentada como tempo garantido.
- A meta Lighthouse acima de 90 só poderá ser confirmada por auditoria após publicar. A instalação e a tela de abertura seguem os recursos disponíveis em cada sistema.

## Detalhes técnicos
- Manter React, TanStack Start, Vite, Tailwind, jsPDF e a configuração atual do projeto; não substituir o roteamento por outra estrutura.
- Escrever novos módulos funcionais em JavaScript e componentes em JSX. A conversão integral para zero TypeScript não será feita: os arquivos estruturais exigidos pelo ambiente, as rotas e os componentes existentes do sistema visual poderão permanecer em TypeScript/TSX. Não criar `src/pages` ou um novo `App`.
- Separar persistência, regras, PDF e interface; `StorageProvider`, `OrderRepository` e `SettingsRepository` encapsulam IndexedDB para uma futura troca de armazenamento sem reescrever telas.
- Manter as regras atuais em `src/lib/os.ts` e o desenho do PDF em `src/lib/pdf.ts`, conforme as instruções do projeto; adicionar testes para as novas regras fora da interface.
- Usar biblioteca consolidada para IndexedDB e QR Code. Manter PDF desenhado com jsPDF para impressão nítida; html2canvas apenas se for necessário capturar conteúdo visual.
- Preservar o registrador único de PWA e bloquear seu registro no desenvolvimento e nas prévias.

## Verificação
Testar regras de garantia, status, unicidade, busca e persistência; conferir a sequência configurações → nova ordem → salvar → PDF → histórico → edição → novo PDF. Verificar também fotos, checklist Outro e telas em celular e computador. Registrar separadamente o que depende de publicação e testes em aparelhos reais.