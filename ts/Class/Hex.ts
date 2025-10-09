export class Hex {
  private selectedColor: HTMLDivElement;
  private inputs: NodeListOf<HTMLInputElement>;
  private gridItems: NodeListOf<HTMLDivElement>;
  private content = document.querySelector('main.content') as HTMLElement;
  private inputColumns = document.querySelectorAll('div.input-col');
  private copyButton = document.querySelector('button.copy-hex') as HTMLButtonElement;
  // private savedColorsDisplay: HTMLDivElement;
  // private savedColorsDiv: HTMLDivElement;
  // private addSavedColor: HTMLDivElement;

  private activeInput: 'r' | 'g' | 'b' = 'r';
  private currentColor: Record<'r' | 'g' | 'b', string> = {r: 'FF', g: 'FF', b: 'FF'};

  constructor() {
    this.selectedColor = document.querySelector('div.selected-color') as HTMLDivElement;
    this.inputs = document.querySelectorAll('input.hex-input');
    this.gridItems = document.querySelectorAll('div.hex-grid div.col');
    // this.savedColorsDisplay = document.querySelector('div.saved-row > div.col') as HTMLDivElement;
    // this.savedColorsDiv = document.querySelector('div.saved') as HTMLDivElement;
    // this.addSavedColor = document.querySelector('div.add') as HTMLDivElement;

    this.bindEvents();
    this.init();
  }

  private bindEvents(): void {
    this.inputs.forEach(input => {
      input.onclick = () => {
        this.activeInput = input.id as 'r' | 'g' | 'b';

        this.setActiveInput();
      };
    });

    this.gridItems.forEach(gridItem => {
      gridItem.onclick = () => {
        this.updateColor(gridItem.innerHTML);
        this.cycleActiveInput();
        this.setActiveInput();
      };
    });

    this.inputColumns.forEach(col => {
      col.addEventListener('click', () => {
        this.activeInput = (col.querySelector('input.hex-input') as HTMLInputElement).id as 'r' | 'g' | 'b';

        this.setActiveInput();
      });
    });

    this.copyButton.onclick = async () => {
      const hex = this.getHex();

      if (navigator.clipboard && window.isSecureContext) await this.copyToClipboard(hex);
      else await this.copyFallback(hex);

      this.copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';

      setTimeout(() => this.copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy', 2000);
    }

    // this.addSavedColor.onclick = () => this.saveCurrentColor();

    // document.onclick = (e) => {
    //   const target = e.target as HTMLElement;
    //   // if (target.classList.contains('item') && !target.classList.contains('add')) {
    //   //   this.loadSavedColor(target.innerHTML);
    //   // }
    //
    //   console.log(target);
    //
    //   if (target.classList.contains('input-col')) {
    //     const input = target.querySelector('input.hex-input') as HTMLInputElement;
    //
    //     this.activeInput = input.id as 'r' | 'g' | 'b';
    //
    //     this.setActiveInput();
    //   }
    // };
    //
    // document.oncontextmenu = (e) => {
    //   const target = e.target as HTMLElement;
    //   if (target.classList.contains('item')) {
    //     e.preventDefault();
    //     this.removeSavedColor(target.innerHTML);
    //   }
    // };
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied:', text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  private async copyFallback(text: string): Promise<void> {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    document.execCommand('copy');

    document.body.removeChild(textarea);
  }

  private init(): void {
    this.setColor();
    this.setActiveInput();
    // this.setSavedColors();
  }

  private setActiveInput(): void {
    this.inputs.forEach((input) => {
      const parent = input.closest('div.input-col');

      if (!parent) return;

      parent.classList.remove('active');

      if (input.id === this.activeInput) parent.classList.add('active');
    });

    this.updateGrid();
  }

  private updateColor(value: string): void {
    this.currentColor[this.activeInput] = value;

    this.inputs.forEach((input) => (input.value = this.currentColor[input.id as 'r' | 'g' | 'b']));

    this.setColor();
  }

  private setColor(): void {
    const hex = this.getHex();
    this.content.style.backgroundColor = hex;

    const contrastColor = this.checkContrast(this.currentColor.r, this.currentColor.g, this.currentColor.b);

    const r = parseInt(contrastColor.slice(1, 3), 16);
    const g = parseInt(contrastColor.slice(3, 5), 16);
    const b = parseInt(contrastColor.slice(5, 7), 16);

    this.content.style.backgroundImage = `radial-gradient(rgba(${r}, ${g}, ${b}, .05) .0625rem, transparent 0)`;

    this.gridItems.forEach((item) => {
      item.addEventListener('mouseenter', () => item.style.boxShadow = `inset 0 0 0 .125rem rgba(${r}, ${g}, ${b}, .5)`);

      item.addEventListener('mouseleave', () => item.style.boxShadow = '');
    });

    this.selectedColor.innerHTML = hex;
  }

  private updateGrid(): void {
    this.gridItems.forEach((item) => {
      const val = item.innerHTML;
      let bgColor = '';

      if (this.activeInput === 'r') bgColor = `#${val}${this.currentColor.g}${this.currentColor.b}`;
      if (this.activeInput === 'g') bgColor = `#${this.currentColor.r}${val}${this.currentColor.b}`;
      if (this.activeInput === 'b') bgColor = `#${this.currentColor.r}${this.currentColor.g}${val}`;

      const r = bgColor.slice(1, 3);
      const g = bgColor.slice(3, 5);
      const b = bgColor.slice(5, 7);

      item.style.backgroundColor = bgColor;
      item.style.color = this.checkContrast(r, g, b);
    });
  }

  private checkContrast = (r: string, g: string, b: string) => {
    const [R, G, B] = [r, g, b].map(c => parseInt(c, 16));

    const L =
      .2126 * (R! / 255 <= .03928 ? R! / 255 / 12.92 : Math.pow((R! / 255 + .055) / 1.055, 2.4)) +
      .7152 * (G! / 255 <= .03928 ? G! / 255 / 12.92 : Math.pow((G! / 255 + .055) / 1.055, 2.4)) +
      .0722 * (B! / 255 <= .03928 ? B! / 255 / 12.92 : Math.pow((B! / 255 + .055) / 1.055, 2.4));

    const target = 4.5;

    let Lt = L > .5 ? (L + .05) / target - .05 : (L + .05) * target - .05;
    Lt = Math.min(Math.max(Lt, 0), 1);

    let gray = Math.round((Lt <= .0031308 ? Lt * 12.92 : 1.055 * Math.pow(Lt, 1 / 2.4) - .055) * 255);
    gray = L > .5 ? Math.min(gray, 50) : Math.max(gray, 205);

    const hex = gray.toString(16).padStart(2, '0');
    return `#${hex}${hex}${hex}`;
  };


  // private updateSavedColors(): void {
  //   this.savedColorsDiv.innerHTML = '';
  //   const saved = localStorage.getItem('savedColors');
  //   if (!saved) return;
  //
  //   saved.split(' ').forEach((color) => {
  //     const r = color.slice(1, 3);
  //     const g = color.slice(3, 5);
  //     const b = color.slice(5, 7);
  //     const textColor = this.checkContrast(r, g, b);
  //
  //     const div = document.createElement('div');
  //     div.className = 'col item center f-0';
  //     div.style.backgroundColor = color;
  //     div.style.color = textColor;
  //     div.innerHTML = color;
  //     this.savedColorsDiv.appendChild(div);
  //   });
  // }
  //
  // private setSavedColors(): void {
  //   if (localStorage.getItem('savedColors')) {
  //     this.savedColorsDisplay.classList.remove('hidden');
  //     this.updateSavedColors();
  //   }
  // }
  //
  // private saveCurrentColor(): void {
  //   this.savedColorsDisplay.classList.remove('hidden');
  //   const current = this.getHex();
  //   const saved = localStorage.getItem('savedColors');
  //   let colors = saved ? saved.split(' ') : [];
  //
  //   if (!colors.includes(current)) {
  //     if (colors.length >= 7) colors = colors.slice(1);
  //     colors.push(current);
  //     localStorage.setItem('savedColors', colors.join(' '));
  //   }
  //
  //   this.updateSavedColors();
  // }
  //
  // private removeSavedColor(color: string): void {
  //   const saved = localStorage.getItem('savedColors');
  //   if (!saved) return;
  //   const colors = saved.split(' ').filter((c) => c !== color);
  //   localStorage.setItem('savedColors', colors.join(' '));
  //   this.updateSavedColors();
  // }
  //
  // private loadSavedColor(hex: string): void {
  //   this.currentColor.r = hex.slice(1, 3);
  //   this.currentColor.g = hex.slice(3, 5);
  //   this.currentColor.b = hex.slice(5, 7);
  //   this.inputs.forEach(
  //     (input) => (input.innerHTML = this.currentColor[input.id as 'r' | 'g' | 'b'])
  //   );
  //   document.body.style.backgroundColor = this.getHex();
  //   this.setColor();
  //   this.setActiveInput();
  // }

  private cycleActiveInput(): void {
    if (this.activeInput === 'r') this.activeInput = 'g';
    else if (this.activeInput === 'g') this.activeInput = 'b';
    else this.activeInput = 'r';
  }

  private getHex = () => `#${Object.values(this.currentColor).join('')}`;
}
