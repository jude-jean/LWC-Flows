import { LightningElement, api } from 'lwc';

export default class userOrQueueSelect extends LightningElement {
    @api iconName;
    selectedItemValue;

    handleSelect(event) {
        this.selectedItemValue = event.detail.value;
        console.log('Choix sélectionné = '+event.detail.value);
        this.dispatchEvent(new CustomEvent('userorqueue', {
            'detail' : this.selectedItemValue
        }))
    }
}