# 🎯 GUIA RÁPIDO - Estrutura Reorganizada do Promptica

## 📍 Localização de Arquivos por Tipo

### Preciso adicionar uma NOVA PÁGINA:
1. Crie `pages/novo-nome.html` com conteúdo HTML
2. Crie `scripts/novo-nome.js` com lógica JavaScript
3. Crie `styles/novo-nome.css` com estilos
4. Inclua em `pages/novo-nome.html`:
   ```html
   <link rel="stylesheet" href="../styles/base.css">
   <link rel="stylesheet" href="../styles/novo-nome.css">
   <script src="../config.js"></script>
   <script src="../scripts/shared.js"></script>
   <script src="../scripts/novo-nome.js"></script>
   ```

### Preciso modificar ESTILOS:
- **Globais**: Edite `styles/base.css`
- **De uma página específica**: Edite `styles/[nome-pagina].css`

### Preciso adicionar FUNCIONALIDADE:
- **Compartilhada**: Adicione em `scripts/shared.js`
- **Específica de página**: Edite `scripts/[nome-pagina].js`

### Preciso usar CONFIGURAÇÕES:
- Todas as chaves estão em `config.js`
- Acesse assim em qualquer script:
  ```javascript
  const GEMINI_API_KEY = window.GEMINI_API_KEY;
  const SUPABASE_URL = window.SUPABASE_URL;
  ```

---

## 🔄 Fluxo de Navegação

```
home.html (Tela Inicial)
├── Novo Prompt → checklist.html
├── Meus Prompts → historico.html
│   └── Visualizar Prompt → visualizar.html
│   └── Editar Prompt → checklist.html (modo edição)
├── Login → login.html
│   └── Cadastrar → cadastro.html
└── Perfil → usuario.html
    ├── Editar Perfil → editar-perfil.html
    ├── Ajuda → ajuda.html
    ├── Fale Conosco → fale.html
    └── Política → politica.html
```

---

## 📊 Arquivos por Funcionalidade

| Funcionalidade | HTML | JS | CSS |
|---|---|---|---|
| **Home** | home.html | home.js | home.css |
| **Criar Prompt** | checklist.html | checklist.js | checklist.css |
| **Ver Resultado** | resultado.html | resultado.js | resultado.css |
| **Histórico** | historico.html | historico.js | historico.css |
| **Visualizar** | visualizar.html | visualizar.js | visualizar.css |
| **Login** | login.html | login.js | login.css |
| **Cadastro** | cadastro.html | cadastro.js | cadastro.css |
| **Perfil** | usuario.html | usuario.js | usuario.css |
| **Editar Perfil** | editar-perfil.html | editar-perfil.js | editar-perfil.css |
| **Ajuda** | ajuda.html | ajuda.js | ajuda.css |
| **Contato** | fale.html | fale.js | fale.css |
| **Política** | politica.html | politica.js | politica.css |
| **Globais** | - | shared.js | base.css |

---

## 🛠️ Tarefas Comuns

### ✏️ Mudar o título de uma página:
```html
<!-- Em pages/[nome].html -->
<title>Novo Título – Promptica</title>
```

### 🎨 Adicionar estilo a um elemento:
```css
/* Em styles/[nome].css */
.meu-elemento {
  color: #333;
  padding: 10px;
}
```

### ⚙️ Adicionar função reutilizável:
```javascript
// Em scripts/shared.js
function minhaFuncao() {
  // código aqui
}
```

### 🔗 Criar um link para outra página:
```html
<!-- Em pages/[nome].html -->
<a href="outra-pagina.html">Ir para outra página</a>
<!-- ou -->
<button onclick="location.href = 'outra-pagina.html'">Ir</button>
```

### 💾 Acessar dados do localStorage:
```javascript
// Carregar
const data = JSON.parse(localStorage.getItem("chave"));

// Salvar
localStorage.setItem("chave", JSON.stringify(data));
```

---

## 📦 Dependências Principais

- **Gemini API**: Para geração de prompts
- **Supabase**: Para autenticação e storage de dados
- **localStorage**: Para dados locais

---

## ⚠️ Pontos Importantes

1. **Sempre inclua** `config.js` e `shared.js` em novas páginas
2. **Nomenclatura**: Use kebab-case para nomes de arquivos (ex: `editar-perfil.html`)
3. **Navegação**: Use `location.href` para navegar entre páginas
4. **Storage**: Dados locais em `localStorage`, dados remotos em Supabase
5. **Estilos**: Aplique base.css primeiro, depois estilos específicos

---

**Última atualização**: 18 de maio de 2026
