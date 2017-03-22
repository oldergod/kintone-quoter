class KintoneSpaceQuoter {
  private parentUl: HTMLUListElement;

  constructor(parentUl) {
    this.parentUl = parentUl;
  }

  render(): void {
    const element: HTMLAnchorElement = document.createElement('a');
    element.innerText = '引用';
    element.addEventListener('click', this.quote.bind(this));
    element.classList.add('ocean-ui-comments-commentbase-quote');

    const li: HTMLLIElement = document.createElement('li');
    li.appendChild(element);

    this.parentUl.appendChild(li);
  }

  quote(event: Event): void {
    let selectedText: string = window.getSelection().toString();
    if (!selectedText) {
      selectedText = this.wholeText();
    }

    const responseLink: HTMLElement = <HTMLElement>this.parentUl.querySelector('.ocean-ui-comments-commentbase-comment');
    responseLink.click();

    const quotingNode: HTMLDivElement = KintoneQuoterHelper.quotingNode(selectedText);
    requestAnimationFrame(() => window.getSelection().getRangeAt(0).insertNode(quotingNode));
  }

  wholeText(): string {
    const commentBaseBody: HTMLElement = <HTMLElement>this.parentUl.closest('.ocean-ui-comments-commentbase-body');
    const commentBaseContents: HTMLElement = <HTMLElement>commentBaseBody.querySelector('.ocean-ui-comments-commentbase-contents');
    return commentBaseContents.innerText.trim();
  }
}

class KintoneAppCommentQuoter {
  private parentDiv: HTMLDivElement;

  constructor(parentDiv) {
    this.parentDiv = parentDiv;
  }

  render(): void {
    const element: HTMLAnchorElement = document.createElement('a');
    element.innerText = '引用';
    element.addEventListener('click', this.quote.bind(this));
    element.classList.add('commentlist-footer-quote-gaia');

    this.parentDiv.appendChild(element);
  }

  quote(event: Event): void {
    let selectedText: string = window.getSelection().toString();
    if (!selectedText) {
      selectedText = this.wholeText();
    }

    const responseLink: HTMLElement = <HTMLElement>this.parentDiv.querySelector('.commentlist-footer-reply-gaia');
    responseLink.click();

    const quotingNode: HTMLDivElement = KintoneQuoterHelper.quotingNode(selectedText);
    requestAnimationFrame(() => window.getSelection().getRangeAt(0).insertNode(quotingNode));
  }

  wholeText(): string {
    const commentBase: HTMLElement = <HTMLElement>this.parentDiv.closest('.itemlist-item-gaia');
    const commentBaseBody: HTMLElement = <HTMLElement>commentBase.querySelector('.commentlist-body-gaia');
    return commentBaseBody.innerText.trim();
  }
}

class KintoneQuoterHelper {
  static quotingNode(text: string): HTMLDivElement {
    const fontTag: HTMLFontElement = document.createElement('font');
    fontTag.style.color = '#999999';
    fontTag.innerText = '> ' + text.split('\n').join('\n> ');

    const italicTag: HTMLElement = document.createElement('i');
    italicTag.appendChild(fontTag);

    const divTag = document.createElement('div');
    divTag.appendChild(italicTag);
    return divTag;
  }
}

class KintoneQuoterLooper {
  private modifiedDomIds: number[];

  constructor() {
    this.modifiedDomIds = [];
  }

  init(): void {
    this.loop();
  }

  static get DELAY(): number {
    return 300;
  }

  loop(): void {
    setInterval(this.step.bind(this), KintoneQuoterLooper.DELAY);
  }

  step(): void {
    this.stepSpace();
    this.stepAppComment();
  }

  stepSpace(): void {
    const commentBases = document.querySelectorAll('div.ocean-ui-comments-commentbase');
    Array.from(commentBases).forEach(commentBase => {
      const classString: string = commentBase.classList.toString();
      // ugly workaround but hey! Life is short
      const idContainedString: string | undefined = classString.split(' ').filter(s => /t-id-/.test(s)).pop();
      if (!idContainedString) return;
      const commentBaseId: number = Number(idContainedString.split('-').pop());

      if (this.modifiedDomIds.includes(commentBaseId)) return;
      this.modifiedDomIds.push(commentBaseId);
      const kintoneCommentQuoter = new KintoneSpaceQuoter(commentBase.querySelector('.ocean-ui-comments-commentbase-actions'));
      kintoneCommentQuoter.render();
    })
  }

  stepAppComment(): void {
    const itemList = document.querySelectorAll('div.itemlist-item-gaia');
    Array.from(itemList).forEach(item => {
      if (item.querySelector('.commentlist-footer-quote-gaia')) return;

      const kintoneCommentQuoter = new KintoneAppCommentQuoter(item.querySelector('.itemlist-footer-gaia'));
      kintoneCommentQuoter.render();
    })
  }
}

new KintoneQuoterLooper().init();
