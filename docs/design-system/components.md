# Biblioteca de Componentes — NEXA Workspace
## Design System v1.0 · Fase 1

---

## Atomic Design — Estrutura
Átomos → Button, Input, Checkbox, Badge
Moléculas → Toast, Modal, Form Group


---

## 01 · Botões

### Variantes

| Variante      | Uso principal                        | Background | Texto   |
|---------------|--------------------------------------|------------|---------|
| btn-primary   | Ação principal, CTA                  | #3D5FA8    | #FFFFFF |
| btn-secondary | Ações secundárias, alternativas      | transparent| --text-primary |
| btn-ghost     | Cancelar, ações de baixo peso        | transparent| --text-secondary |
| btn-danger    | Ações destrutivas (excluir, revogar) | #D93020    | #FFFFFF |

### Tamanhos

| Tamanho | Altura | Padding   | Font-size | Border-radius |
|---------|--------|-----------|-----------|---------------|
| sm      | 28px   | 0 12px    | 12px      | 6px           |
| md (padrão) | 36px | 0 16px  | 14px      | 8px           |
| lg      | 44px   | 0 24px    | 15px      | 10px          |

### Estados

| Estado   | Descrição                                      |
|----------|------------------------------------------------|
| Default  | Estado base do componente                      |
| Hover    | Primary → #1E3A7A · Danger → #A82518           |
| Active   | transform: scale(0.98)                         |
| Loading  | Ícone ti-refresh + texto "Salvando…" · opacity .7 |
| Disabled | opacity: 0.4 · pointer-events: none            |
| Icon only| width/height iguais à altura · justify: center |

### Tokens CSS

```css
--btn-primary-bg:       #3D5FA8;
--btn-primary-hover:    #1E3A7A;
--btn-danger-bg:        #D93020;
--btn-danger-hover:     #A82518;
--btn-transition:       all 150ms ease;
```

---

## 02 · Inputs

### Variantes

| Variante      | Uso                          | Obs                          |
|---------------|------------------------------|------------------------------|
| Text          | Nome, campos genéricos       | —                            |
| Email         | Login, convites              | Ícone ti-mail como prefixo   |
| Password      | Senha                        | Toggle de visibilidade       |
| CNPJ/Máscara  | Documentos                   | Validação algorítmica        |
| Textarea      | Descrições longas            | Resize: none · height 80px   |
| Select        | Escolha de papel/função      | Herda estilo do input        |

### Estados

| Estado   | Border          | Focus Ring                          | Ícone sufixo         |
|----------|-----------------|-------------------------------------|----------------------|
| Default  | --border-strong | —                                   | —                    |
| Hover    | #9099B2         | —                                   | —                    |
| Focus    | #3D5FA8         | 0 0 0 3px rgba(61,95,168,.12)       | —                    |
| Success  | #22A05A         | 0 0 0 3px rgba(34,160,90,.12)       | ti-check · #22A05A   |
| Error    | #D93020         | 0 0 0 3px rgba(217,48,32,.12)       | ti-alert-circle · #D93020 |
| Disabled | --border-strong | —                                   | opacity: .4          |

### Anatomia
[ Prefixo? ] [ Placeholder / Valor ] [ Sufixo? ]
↑ label acima · hint abaixo ↑


### Tokens CSS

```css
--input-height:         36px;
--input-radius:         8px;
--input-bg:             var(--surface-2);
--input-border:         var(--border-strong);
--input-focus-border:   #3D5FA8;
--input-error-border:   #D93020;
--input-success-border: #22A05A;
--input-font-size:      14px;
```

---

## 03 · Checkboxes

### Estados

| Estado        | Visual                                           |
|---------------|--------------------------------------------------|
| Unchecked     | Border --border-strong · fundo --surface-2       |
| Checked       | Background #3D5FA8 · ícone ti-check branco       |
| Indeterminate | Background #3D5FA8 · ícone ti-minus branco       |
| Disabled      | opacity: .4 · cursor: not-allowed                |
| Error         | border-color: #D93020 · label vermelho           |

### Anatomia
[ ☐ ] Label principal
Hint ou mensagem de erro abaixo


### Tokens CSS

```css
--checkbox-size:        16px;
--checkbox-radius:      4px;
--checkbox-checked-bg:  #3D5FA8;
--checkbox-icon-color:  #FFFFFF;
--checkbox-icon-size:   10px;
```

---

## 04 · Toasts

### Variantes

| Tipo    | Background | Border   | Texto   | Ícone            |
|---------|------------|----------|---------|------------------|
| success | #EDFCF2    | #22A05A  | #145E38 | ti-circle-check  |
| info    | #EEF1F8    | #3D5FA8  | #1E3A7A | ti-info-circle   |
| warning | #FFF8E6    | #E5A000  | #7A5200 | ti-alert-triangle|
| danger  | #FEF0EE    | #D93020  | #6E1A14 | ti-alert-circle  |

### Anatomia
[ Ícone ] [ Título (500) ] [ × fechar ]
[ Mensagem (400, 12px) ]


### Especificações

- Padding: 12px 14px
- Border-radius: 10px
- Border: 0.5px solid
- Max-width: 340px
- Gap interno: 10px
- Posição padrão: bottom-right (produção)
- Auto-dismiss: 5000ms (success/info) · manual (warning/danger)

---

## 05 · Badges

### Variantes

| Tipo    | Background | Border   | Texto   |
|---------|------------|----------|---------|
| primary | #EEF1F8    | #C5CEE8  | #1E3A7A |
| success | #EDFCF2    | #9FD4B4  | #145E38 |
| warning | #FFF8E6    | #F0CC80  | #7A5200 |
| danger  | #FEF0EE    | #F0B4AE  | #6E1A14 |
| neutral | --surface-1| --border-strong | --text-secondary |

### Tokens CSS

```css
--badge-padding:   2px 8px;
--badge-radius:    20px;
--badge-font-size: 11px;
--badge-font-weight: 500;
--badge-border:    0.5px solid;
```

---

## 06 · Modais

### Variantes

| Tipo          | Uso                                    |
|---------------|----------------------------------------|
| Confirmação   | Ações destrutivas — excluir, revogar   |
| Formulário    | Convidar membro, criar item rápido     |

### Anatomia
[ Header: Título + subtítulo + × fechar ]
[ Body: Conteúdo / formulário ]
[ Footer: Ações secundária + primária ]


### Especificações

- Max-width: 420px
- Border-radius: 14px
- Background: --surface-2
- Border: 0.5px solid --border
- Overlay: rgba(15,20,40,.5)
- Header padding: 18px 20px 14px
- Body padding: 16px 20px
- Footer padding: 14px 20px
- Footer background: --surface-1
- Footer justify: flex-end
- Gap entre botões: 8px

---

## Acessibilidade — Checklist

- [ ] Todos os inputs têm `<label>` associado
- [ ] Botões icon-only têm `aria-label`
- [ ] Ícones decorativos têm `aria-hidden="true"`
- [ ] Toasts usam `role="alert"` em produção
- [ ] Modais têm `role="dialog"` e `aria-modal="true"`
- [ ] Focus trap ativo dentro do modal
- [ ] Contraste mínimo AA (4.5:1) em todos os textos
- [ ] Estados de erro comunicados via `aria-invalid` e `aria-describedby`