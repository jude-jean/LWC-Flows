public with sharing class UserController {
    public UserController() {

    }

    @AuraEnabled(cacheable=true scope='global')
    public static User[] searchUsers(String searchTerm){
        try {
            System.debug('searchTerm = '+searchTerm);
            if(searchTerm == null || searchTerm == '') {
                return new List<User>();
            }
            else {
                searchTerm = searchTerm.trim();
            }
            searchTerm = '%'+searchTerm+'%';
            return [ Select Id, Name From User Where Name Like :searchTerm and isActive = true ORDER By Name Limit 50];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true scope='global')
    public static QueueSobject[] searchQueues(String searchTerm){
        try {
            System.debug('searchTerm = '+searchTerm);
            if(searchTerm == null || searchTerm == '') {
                return new List<QueueSobject>();
            }
            else {
                searchTerm = searchTerm.trim();
            }
            searchTerm = '%'+searchTerm+'%';
            //return [ Select Id, Name, DeveloperName From Group Where Type = 'Queue' And SobjetType Like '%Case%' And Name Like :searchTerm Order By Name Limit 50];
            return [ select Id, SobjectType, Queue.Name, Queue.DeveloperName, QueueId from QueueSobject Where SobjectType = 'Case' And Queue.Name Like :searchTerm Order By Queue.Name Limit 50];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }    
}