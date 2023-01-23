import { LightningElement, api } from 'lwc';
import { FlowNavigationFinishEvent, FlowNavigationBackEvent, FlowAttributeChangeEvent } from 'lightning/flowSupport';
//import { NavigationMixin } from 'lightning/navigation';

export default class userOrQueueOwnerNav extends LightningElement {
    @api isSubmit;
    displayBackButton;
    url
    casePageRef;

    connectedCallback() {
        console.log('isSubmit = '+this.isSubmit);
        this.displayBackButton = (this.isSubmit == false) ? true : false; 
        console.log('displayBackButton = '+this.displayBackButton);
        this.casePageRef = {
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Case',
                actionName: 'home'
            }
        };
        //this[NavigationMixin.GenerateUrl](this.casePageRef)
        //    .then(url => this.url = url);                       
    }

    handleBack() {
        const flowBack = new FlowNavigationBackEvent();
        console.log('Navigation vers Back');
        this.dispatchEvent(flowBack);
    }

    handleQuit(evt) {
        console.log('Quit button...');
        if(this.isSubmit) { 
            //console.log('Navigation vers '+this.url);
            //evt.preventDefault();
            //evt.stopPropagation();    
            //this[NavigationMixin.Navigate](this.casePageRef);           
            window.open('/lightning/o/Case/list?filterName=Recent', '_top');

        }
        else {
            window.history.back();
        }

    }

    renderedCallback() {
        console.log('renderedCallback() isSubmit = '+this.isSubmit);
        console.log('renderedCallback() displayBackButton = '+this.displayBackButton);
    }
}