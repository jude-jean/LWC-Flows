import { LightningElement, api, wire, track } from 'lwc';
import LightningPrompt from 'lightning/prompt';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import changeCaseOwner from '@salesforce/apex/CaseController.changeCaseOwner';
//import { publish, MessageContext } from 'lightning/messageService';
//import USER_OR_QUEUE_OWNER_CHANNEL from '@salesforce/messageChannel/UserOrQueueOwner__c';
import { NavigationMixin } from 'lightning/navigation';
import { FlowNavigationFinishEvent, FlowNavigationNextEvent, FlowAttributeChangeEvent } from 'lightning/flowSupport';


export default class caseMassChangeOwner extends NavigationMixin(LightningElement) {
    @api ids;
    @api objectApiName;
    @api url;
    @api currentFirstNameOwner;
    @api currentLastNameOwner;
    @api currentOwnerId;
    ownerSelected;
    disabled = false;
    //message = 'You have selected ';
    message;
    //@wire(MessageContext)
    //messageContext;
    toDisplayed = false;
    toastTimeout;
    toastMessage;
    toastVariant;
    toastIconName;
    @api isSubmit = false;

    @track _endMessage;
    @api 
    get endMessage() {
        return this._endMessage;
    };
    
    set endMessage(value) {
        this._endMessage = value;
    }


    handleToastClose() {
        console.log('Close icon fired');
        this.toDisplayed = false;
        this.ownerSelected = {};
        if(this.isSubmit) {
            window.clearTimeout(this.toastTimeout);
            this.endMessage = 'Your request is being processed';
            const attributeChangeEvent = new FlowAttributeChangeEvent('endMessage', this.endMessage);
            this.dispatchEvent(attributeChangeEvent);                    
            const flowNext = new FlowNavigationNextEvent();
            console.log('handleToastClose() : Navigation vers Next');
            this.dispatchEvent(flowNext);
        }        
    }

    connectedCallback() {
        if(this.ids) {
            this.ids = this.ids.split(',').filter(function(e) {
                return e !=null && e != '';
            });
            console.log('ids ='+this.ids);
            console.log('objectApiName = '+this.objectApiName);
            console.log('url = '+this.url);
            console.log('OwnerId = '+this.currentOwnerId+', FirstName = '+this.currentFirstNameOwner+', LastName = '+this.currentLastNameOwner);
            //this.message += this.ids.length+' ';
            //this.message += this.ids.length > 1 ? 'records' : 'record';
            this.message = `Hi ${this.currentFirstNameOwner}, you have selected ${this.ids.length} `+(this.ids.length > 1 ? 'records' : 'record.');
            //this.template.addEventListener('toast', this.handleToast);
            this.template.addEventListener('toast', (event) => {
                console.log('ontoast fired...');
                if(event.detail == 'clear') {
                    this.toDisplayed = false;
                }
            });
            console.log('Origin LWC = '+window.location.host);
            console.log('History = '+JSON.stringify(window.history)); 
            console.log('Dcoument referrer = '+document.referrer);
            if(window.location !== window.parent.location) {
                console.log('LWC is in an iFrame');
            }
            //console.log('previous = '+window.history.state.prevUrl);
            //var oLocation = location, aLog = ["Property (Typeof): Value", "location (" + (typeof oLocation) + "): " + oLocation ];
            //for (var sProp in oLocation){
            //aLog.push(sProp + " (" + (typeof oLocation[sProp]) + "): " + (oLocation[sProp] || "n/a"));
            //}
            //console.log(aLog.join("\n"));                       
        }
        else {
            console.log('L\'utilisateur n\'a sélectionné aucun case');
            this.toDisplayed = true;
            this.toastMessage = 'Select at least one record and try again. To continue, click on Cancel button > Quit button';
            this.toastVariant = 'error';            
        }
    }

    handleOwnerSelected(event) {
        console.log('caseMassChangeOwner ownerSelected = ', event.detail);
        this.ownerSelected = JSON.parse(event.detail);
        console.log('caseMassChangeOwner ownerSelected', this.ownerSelected);
    }

    handleCancel() {
        console.log('Cancel');
        this.endMessage = 'You have clicked on the Cancel button.';
        console.log('_endMessage = '+this._endMessage);
        const attributeChangeEvent = new FlowAttributeChangeEvent('endMessage', this.endMessage);
        const ret = this.dispatchEvent(attributeChangeEvent);                
        console.log('ret = '+ret);
        const flowNext = new FlowNavigationNextEvent();
        console.log('Navigation vers Next');
        this.dispatchEvent(flowNext);        
        //const flowEnd = new FlowNavigationNextEvent();        
        //window.location.assign("/lightning/page/home");
        //this[NavigationMixin.Navigate]({
        //    type: 'standard__objectPage',
        //    attributes: {
        //        objectApiName: 'Case',
        //        actionName: 'home',
        //    },
        //});        
    }

    handleSubmit() {
        console.log('Submit ownerSelected = ', this.ownerSelected);
        if(this.ownerSelected == undefined || JSON.stringify(this.ownerSelected) == '{}') {
            try {
                console.log('You must to select an owner!!!');
                const payload = {
                    msg: "Message émis par le composant LWC caseMassChangeOwner"
                }
                this.toDisplayed = true;
                this.toastMessage = 'Select an owner before clicking on Submit button.';
                this.toastVariant = 'error';
                
                //window.clearTimeout(this.toastTimeout)
                //this.toastTimeout = setTimeout(() => {
                //    this.toDisplayed = false;
                //}, 10000);
                //publish(this.messageContext, USER_OR_QUEUE_OWNER_CHANNEL, payload);
                //const event = new ShowToastEvent({
                //    title: 'You must to select an owner',
                //    message: 'Please Select an Owner.',
                //    variant: 'warning'
                //});
                //this.dispatchEvent(event);
                window.postMessage(payload, "*");
            }
            catch(error) {
                console.log(error.getMessage());
            }
            //LightningPrompt.open({
            //    message: 'You must to select an owner!!!',
            //    //theme defaults to "default"
            //    label: 'Please Select an Owner', // this is the header text
            //    //defaultValue: 'initial input value', //this is optional
            //}).then((result) => {
            //    //Prompt has been closed
            //    //result is input text if OK clicked
            //    //and null if cancel was clicked
            //});
        }
        else{
            changeCaseOwner({
                "currentOwnerId": this.currentOwnerId,
                "newOwnerId": this.ownerSelected.id,
                "newOwnerType": this.ownerSelected.type,
                "newOwnerName": this.ownerSelected.name,
                "caseIds": this.ids
            }).then((result) => {
                if(result) {
                    this.toastVariant = 'success';
                    this.toastMessage = 'Your Change Owner request is being processed.... See your next notifications to know the result. You will be redirect soon!!';
                    this.isSubmit = true;
                    this.toDisplayed = true;
                    this.disabled = true;

                    //const event = new ShowToastEvent({
                    //    title: 'You must to select an owner',
                    //    message:
                    //        'Please Select an Owner.',
                    //});
                    //this.dispatchEvent(event);                        

                    //const flowEnd = new FlowNavigationFinishEvent();
                    //console.log('Fin du flow');
                    ////const flowEnd = new FlowNavigationNextEvent();
                    //this.dispatchEvent(flowEnd);
                //    this[NavigationMixin.Navigate]({
                //        type: 'standard__objectPage',
                //        attributes: {
                //            objectApiName: 'Case',
                //            actionName: 'home',
                //        },
                //    });                    
                }
            });
        }

    }

    renderedCallback() {
        let elt = this.template.querySelector('[data-id="slds-theme"]');
        console.log('renderredCallBack() elt = ', elt);
        if(elt != null) {
            if(elt.className.indexOf('slds-theme_') == -1) {
                console.log('className = '+elt.className+': ne contient pas la classe slds-theme_'+this.toastVariant);
                elt.className += ' slds-theme_'+this.toastVariant;
                elt = this.template.querySelector('[data-id="slds-icon-utility"]');
                elt.className += ' slds-icon-utility-'+this.toastVariant;
                this.toastIconName = 'utility:'+this.toastVariant;
            }
            else { // on remplace si on a déjà affiché un warning
                if(elt.className.indexOf('slds-theme_warning') > 0) {
                    if(this.toastVariant == 'success') {
                        elt.className.replace('slds-theme_warning', 'slds-theme_success');
                        elt = this.template.querySelector('[data-id="slds-icon-utility"]');
                        elt.className.replace('slds-icon-utility-warning','slds-icon-utility-'+this.toastVariant);
                        this.toastIconName = 'utility:'+this.toastVariant;                        
                    }
                }

            }
            window.clearTimeout(this.toastTimeout);
            this.toastTimeout = setTimeout(() => {
                this.toDisplayed = false;
                this.ownerSelected = {};
                if(this.isSubmit) {
                    this.endMessage = 'Your request is being processed...';
                    const attributeChangeEvent = new FlowAttributeChangeEvent('endMessage', this.endMessage);
                    this.dispatchEvent(attributeChangeEvent);                    
                    const flowNext = new FlowNavigationNextEvent();
                    console.log('renderredCallBack() : Navigation vers Next');
                    this.dispatchEvent(flowNext);
                }
            }, 10000);            
        }

        //if()


    }
    

}