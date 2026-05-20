import React, { useEffect, useState, useContext } from 'react';
import { ExtraFunctions } from './ExtraFunctions';
import { CurrentUserContext } from './ContextProviders/CurrentUserContext';


const ProfileImage = ({ nickname }) => {
    const [profilePic, setProfilePic] = useState("/images/DefaultProfilePic.png");
    const { currentUser, updateCurrentUser } = useContext(CurrentUserContext);

    useEffect(() => {
        const fetchProfileImage = async () => {
            if (nickname) {
                try {
                    const img = await getImage(nickname);
                    setProfilePic(img.profile_pic);
                } catch (error) {
                    console.error('Error fetching user image:', error);
                    // Fallback to default image on error
                    setProfilePic("/images/DefaultProfilePic.png");
                }
            }
        };

        fetchProfileImage();
    }, [currentUser]); // Re-fetch if nickname changes



    const getImage =  async (nickname) => {
        if (nickname) {
            try {
                const res = await fetch(`/api/get_profile_image?nickname=${nickname}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                if (!res.ok) {
                    throw new Error('Failed to fetch user profile');
                }
    
                // Since the server now returns the image data directly, we use res.text()
                const imageUrl = await res.json(); // Get the image data as plain text
                return imageUrl || "/images/DefaultProfilePic.png"; // Fallback if not found
    
            } catch (error) {
                console.error('Error fetching user image:', error);
                return "/images/DefaultProfilePic.png"; // Fallback in case of error
            }
        }
        return "/images/DefaultProfilePic.png"; // Fallback if no nickname is provided
    }




    return (
        <img
              src={profilePic}
              alt={"PIC"}
              className="w-12 h-12 rounded-full ml-3 object-cover border-gray-500 border-[1px] hover:border-[2px]"
            />
    );

};

export default ProfileImage;
