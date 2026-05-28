import React, { useContext, useState, useEffect } from 'react';
import { WindowContext } from '../ContextProviders/WindowContext';
import defaultProfilePic from '../images/DefaultProfilePic.png';
import { CurrentUserContext } from '../ContextProviders/CurrentUserContext';


function LeaderboardWindow() {
    const { windowStates, updateWindowState } = useContext(WindowContext);
    const { visible } = windowStates.leaderboardWindow || {};

    const { currentUser } = useContext(CurrentUserContext);

    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!visible) return;

            setLoading(true);
            try {
                const response = await fetch(`${window.websiteSetting.serverURL}/api/leaderboard`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch leaderboard');
                }

                const data = await response.json();
                setLeaders(data.leaders || []);
                setError("");
            } catch (err) {
                setError("Failed to load leaderboard");
                setLeaders([
                    { nickname: "admin", rank: 1, profilePic: defaultProfilePic, spotsCount: 10 },
                    { nickname: "cool_spotter", rank: 2, profilePic: defaultProfilePic, spotsCount: 8 },
                    { nickname: "admin", rank: 1, profilePic: defaultProfilePic, spotsCount: 10 },
                    { nickname: "cool_spotter", rank: 2, profilePic: defaultProfilePic, spotsCount: 8 },
                    { nickname: "admin", rank: 1, profilePic: defaultProfilePic, spotsCount: 10 },
                    { nickname: "cool_spotter", rank: 2, profilePic: defaultProfilePic, spotsCount: 8 },
                    { nickname: "admin", rank: 1, profilePic: defaultProfilePic, spotsCount: 10 },
                    { nickname: "cool_spotter", rank: 2, profilePic: defaultProfilePic, spotsCount: 8 },
                    { nickname: "admin", rank: 1, profilePic: defaultProfilePic, spotsCount: 10 },
                    { nickname: "cool_spotter", rank: 2, profilePic: defaultProfilePic, spotsCount: 8 },
                    { nickname: "admin", rank: 1, profilePic: defaultProfilePic, spotsCount: 10 },
                    { nickname: "cool_spotter", rank: 2, profilePic: defaultProfilePic, spotsCount: 8 },
                    { nickname: "admin", rank: 1, profilePic: defaultProfilePic, spotsCount: 10 },
                    { nickname: "cool_spotter", rank: 2, profilePic: defaultProfilePic, spotsCount: 8 },
                    { nickname: "admin", rank: 1, profilePic: defaultProfilePic, spotsCount: 10 },
                    { nickname: "cool_spotter", rank: 2, profilePic: defaultProfilePic, spotsCount: 8 },

                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [visible]);

    const handleClose = () => {
        updateWindowState('leaderboardWindow', { visible: false });
    };


    const handleProfileClick = (nickname) => {
        if(nickname == currentUser.nickname){
          updateWindowState('profileWindow', { visible: true });
        }else{
          if(nickname != "deleted"){
            updateWindowState('viewProfileWindow', { visible: true, nickname: nickname });
          }
        }
        
      }

    
      return (
        <div
            id="modal-overlay"
            className={`fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-30 
                transition-opacity transition-visibility duration-500 ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={(e) => e.target.id === 'modal-overlay' && handleClose()}
        >
            <div className="relative bg-white rounded-lg shadow-lg w-[95%] max-w-2xl max-h-[60vh] overflow-y-auto overflow-x-hidden
                mx-4 sm:mx-6 md:mx-8 lg:mx-10">


                <div className='flex items-center justify-center flex-col space-y-4'>
                    <button
                    className="absolute w-8 h-8 rounded-tr-lg rounded-bl-lg text-2xl bg-red-600 text-white font-bold 
                        flex items-center justify-center hover:bg-red-500 transition-all"
                        style={{right:-1, top:-1}}
                    onClick={handleClose}
                    >
                        &times;
                    </button>
                    

                    <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4 sm:mb-6">
                            Leaderboard
                    </h2>
                </div>

                <div className="sm:p-2 md:p-4">
                    <div className="space-y-3 sm:space-y-4 overflow-y-auto">
                        {leaders.map((user, index) => (
                            <div key={index} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 border-b last:border-none">
                                <span className="text-base sm:text-lg font-bold w-6 min-w-[24px]">
                                    {user.rank}
                                </span>
                                <img
                                    src={user.profilePic || defaultProfilePic}
                                    alt="Profile"
                                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-300 object-cover"
                                />
                                <div className="flex-grow min-w-0">
                                    <h3 
                                        className={`text-base sm:text-lg font-semibold text-gray-800 hover:underline 
                                            cursor-pointer truncate`}
                                        onClick={() => handleProfileClick(user.nickname)}
                                    >
                                        {user.nickname}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        {user.spotsCount} spots posted
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {loading && (
                        <p className="text-center text-sm sm:text-base py-4">Loading leaderboard...</p>
                    )}

                    {error && (
                        <p className="text-center text-red-500 text-sm sm:text-base py-4">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LeaderboardWindow;
