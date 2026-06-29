# DutsNails Studio V1

Versão inicial profissional do site da DutsNails com:

- Landing page premium
- Portfólio
- Serviços com valores e duração
- Agendamento no site
- Estrutura de integração com Google Agenda
- APIs prontas para Vercel
- Fallback para WhatsApp caso o Google Agenda ainda não esteja configurado

## Como publicar

1. Suba estes arquivos no GitHub.
2. Importe o projeto na Vercel.
3. Configure as variáveis de ambiente abaixo.

## Variáveis de ambiente necessárias

No painel da Vercel, vá em:

Settings > Environment Variables

Adicione:

```env
GOOGLE_CLIENT_EMAIL=seu-service-account@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=seuemail@gmail.com
ADMIN_EMAIL=seuemail@gmail.com
WHATSAPP_NUMBER=5511966818500
```

## Importante

Para funcionar 100%, você precisa criar uma Service Account no Google Cloud e compartilhar sua Google Agenda com o e-mail da Service Account com permissão de "Fazer alterações nos eventos".

Enquanto isso não for configurado, o site continua funcionando e direciona a cliente para o WhatsApp com a mensagem pronta.

## Arquivos principais

- `index.html`: site completo
- `style.css`: visual premium
- `script.js`: agendamento e interações
- `api/availability.js`: busca horários disponíveis
- `api/book.js`: cria evento no Google Agenda
- `api/config.js`: configurações compartilhadas

