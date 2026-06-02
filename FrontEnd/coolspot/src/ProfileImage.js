import React, { useEffect, useState, useContext } from 'react';
import { ExtraFunctions } from './ExtraFunctions';
import { CurrentUserContext } from './ContextProviders/CurrentUserContext';

import defaultProfilePic from './images/DefaultProfilePic.png';

const ProfileImage = ({ nickname, inSpot, w, h }) => {
    const [profilePic, setProfilePic] = useState(defaultProfilePic);
    const { currentUser, updateCurrentUser } = useContext(CurrentUserContext);

    useEffect(() => {
        const fetchProfileImage = async () => {
            if (nickname) {
                try {
                    const img = await getImage(nickname);
                    setProfilePic(img.profile_pic);
                    if(!img.profile_pic){
                        setProfilePic(defaultProfilePic);
                    }
                } catch (error) {
                    console.error('Error fetching user image:', error);
                    setProfilePic(defaultProfilePic);
                }
            }
        };

        fetchProfileImage();
    }, [currentUser]); 



    const getImage =  async (nickname) => {
        if (nickname) {
            try {
                const res = await fetch(`${window.websiteSetting.serverURL}/api/get_profile_image?nickname=${nickname}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                if (!res.ok) {
                    throw new Error('Failed to fetch user profile');
                }
    
                const imageUrl = await res.json(); 
                return imageUrl || "/images/DefaultProfilePic.png"; 
    
            } catch (error) {
                console.error('Error fetching user image:', error);
                return defaultProfilePic; 
            }
        }
        return defaultProfilePic; 
    }



    //loti stulbs className jo reusoju komponentu gan headerii gan spotos
    return (
        <img
              src={profilePic}
              alt={"PIC"}
              className={`w-${w} h-${h} rounded-full ${!inSpot ? 'ml-3' : ''} object-cover border-gray-500 border-[1px] ${!inSpot ? 'hover:border-[2px]' : ''}`}
            />
    );

};

export default ProfileImage;
