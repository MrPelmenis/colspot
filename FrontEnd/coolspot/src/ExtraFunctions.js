
export class ExtraFunctions {
    static isUserLoggedIn() {
        return Boolean((localStorage.getItem("JWT") != "")
            && (localStorage.getItem("JWT") != null)
            && (localStorage.getItem("JWT") != undefined)
            && (localStorage.getItem("JWT") != "undefined")
            &&(localStorage.getItem("JWT") != "null")
            && (localStorage.getItem("JWT")));
    }

    static convertUTCtoLocal(utcDate) {
        var localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60 * 1000);
        return localDate;
    }
    

    static getTimeAgo(dateTimeString) {
        const givenDateTime = new Date(dateTimeString);
        const currentDateTime = new Date(); 
    
       const timeDifference = Math.floor((currentDateTime - givenDateTime) / 1000);
    
        if (timeDifference < 60) {
            return timeDifference === 1 ? `${timeDifference} second ago` : `${timeDifference} seconds ago`;
        } else if (timeDifference < 3600) {
            const minutes = Math.floor(timeDifference / 60);
            return minutes === 1 ? `${minutes} minute ago` : `${minutes} minutes ago`;
        } else if (timeDifference < 86400) {
            const hours = Math.floor(timeDifference / 3600);
            return hours === 1 ? `${hours} hour ago` : `${hours} hours ago`;
        } else if (timeDifference < 2592000) { 
            const days = Math.floor(timeDifference / 86400);
            return days === 1 ? `${days} day ago` : `${days} days ago`;
        } else if (timeDifference < 31536000) { 
            const months = Math.floor(timeDifference / 2592000); 
            return months === 1 ? `${months} month ago` : `${months} months ago`;
        } else {
            const years = Math.floor(timeDifference / 31536000);
            return years === 1 ? `${years} year ago` : `${years} years ago`;
        }
    }
    
    
    
}
