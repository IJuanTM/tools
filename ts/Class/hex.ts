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
      console.log("Copied:", text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  private async copyFallback(text: string): Promise<void> {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    document.execCommand("copy");

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
    this.content.style.backgroundColor = this.getHex();

    this.selectedColor.innerHTML = this.getHex();
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

  private checkContrast = (r: string, g: string, b: string) => (parseInt(r, 16) * 299 + parseInt(g, 16) * 587 + parseInt(b, 16) * 114) / 1000 > 125 ? '#000' : '#FFF';

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
