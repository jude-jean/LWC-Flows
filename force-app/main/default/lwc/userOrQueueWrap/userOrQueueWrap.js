import { LightningElement, wire, api } from 'lwc';
import searchUsers from '@salesforce/apex/UserController.searchUsers';
import searchQueues from '@salesforce/apex/UserController.searchQueues';

 
export default class userOrQueueWrap extends LightningElement {
    iconName = 'utility:user';
    placeHolder = 'Search users...';
    @api searchTerm;
    @api isUserSelected;
    @api isDisplayed;
    @api users;
    @api queues;
    @api ownerSelected;
    usersToBDD;
    queuesToBDD;
    @wire(searchUsers, {searchTerm: '$usersToBDD'})
    loadUsers(result) {
        console.log('result = ', result);
        if(result.data) {
            this.isDisplayed = true;
            this.users = result.data;
        }
        else {
            this.users = [];
        }
    }

    @wire(searchQueues, {searchTerm: '$queuesToBDD'})
    loadQueues(result) {
        console.log('result = ', result);
        if(result.data) {
            this.isDisplayed = true;
            this.queues = result.data;
        }
        else {
            this.queues = [];
        }
    }

    handleUserOrQueue(event) {
        if(event.detail) {
            if(event.detail == 'User') {
                this.iconName = 'utility:user';
                this.searchTerm = '';
                this.placeHolder = 'Search users...';
                this.isUserSelected = true;
                //this.isDisplayed = false;
            }
            else {
                this.iconName = 'utility:work_order_type';
                this.placeHolder = 'Search queues...';
                this.searchTerm = '';
                this.isUserSelected = false;
            }
            this.isDisplayed = false;
            this.dispatchEvent(new CustomEvent('ownerselected', {
                'detail' : "{}"
            }));                
        }
        else {
            console.error('userOrQueueWrap : Problème avec le choix de l\'utilisateur');
        }
    }

    handleSearchChange(event) {
        window.clearTimeout(this.delayTimeout);
        const searchTerm = event.target.value;
        if(searchTerm.length == 1) {
            console.log('wrap component : toast event created...');
            this.dispatchEvent(new CustomEvent('toast', {
                detail: 'clear',
                bubbles: true
            }));
        }
        this.delayTimeout = setTimeout(() => {
            this.searchTerm = searchTerm;
            if(this.isUserSelected) {
                console.log('searchTerm = '+searchTerm);
                this.usersToBDD = this.searchTerm;
                console.log('usersToBDD = '+this.usersToBDD);
            }
            else {
                this.queuesToBDD = searchTerm;
                console.log('queuesToBDD = '+this.queuesToBDD);
            }
        }, 300);
    }

    handleSelectedName(event) {
        console.log('Nom sélectionné = '+event.target.dataset.name);
        this.searchTerm = event.target.dataset.name;
        this.isDisplayed = true;
        if(this.isUserSelected) {
            const selectedUser = this.users.find(user => user.Name == this.searchTerm);
            this.ownerSelected = {
                'type': 'user',
                'id': selectedUser.Id,
                'name': selectedUser.Name
            }
            this.users = [];
            
        }
        else {
            const selectedQueue = this.queues.find(queue => queue.Queue.Name == this.searchTerm);
            this.ownerSelected = {
                'type': 'queue',
                'id': selectedQueue.QueueId,
                'name': selectedQueue.Queue.Name,
                'developerName': selectedQueue.Queue.developerName
            }
            this.queues = [];
        }
        console.log('ownerSelected = ', this.ownerSelected);
        this.dispatchEvent(new CustomEvent('ownerselected', {
            'detail' : JSON.stringify(this.ownerSelected)
        }))
    }
}