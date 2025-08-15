import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  CodeBracketIcon,
  TrophyIcon,
  FireIcon,
  ClockIcon,
  CogIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ProfileData {
  personalInfo: {
    fullName: string;
    bio: string;
    location: string;
    company: string;
    website: string;
    github: string;
    linkedin: string;
  };
  preferences: {
    preferredLanguage: string;
    difficultyPreference: string;
    dailyGoal: number;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    personalInfo: {
      fullName: user?.username || 'Demo User',
      bio: 'Passionate software developer with expertise in algorithms and data structures. Love solving complex problems and learning new technologies.',
      location: 'San Francisco, CA',
      company: 'Tech Solutions Inc.',
      website: 'https://demo-portfolio.com',
      github: 'https://github.com/demo-user',
      linkedin: 'https://linkedin.com/in/demo-user'
    },
    preferences: {
      preferredLanguage: user?.preferences?.preferredLanguage || 'javascript',
      difficultyPreference: user?.preferences?.difficultyPreference || 'medium',
      dailyGoal: user?.preferences?.dailyGoal || 3,
      notifications: {
        email: true,
        push: true
      }
    }
  });

  const handleSave = async () => {
    try {
      // Here you would normally call an API to update the profile
      console.log('Saving profile data:', profileData);
      setEditMode(false);
      // Show success message
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reset form data
  };

  const updatePersonalInfo = (field: keyof ProfileData['personalInfo'], value: string) => {
    setProfileData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const updatePreferences = (field: keyof ProfileData['preferences'], value: any) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editMode ? (
                  <input
                    type="text"
                    value={profileData.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    className="text-2xl font-bold bg-transparent border-b-2 border-indigo-600 focus:outline-none"
                  />
                ) : (
                  profileData.personalInfo.fullName
                )}
              </h1>
              <p className="text-gray-600 flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-1" />
                {user?.email}
              </p>
              <p className="text-gray-500 text-sm flex items-center">
                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                Member since {new Date(user?.profile?.joinDate || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Problems Solved</p>
              <p className="text-2xl font-bold text-gray-900">{user?.stats?.solvedProblems || 5}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CodeBracketIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{user?.stats?.totalSubmissions || 10}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FireIcon className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{user?.stats?.currentStreak || 3} days</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{user?.stats?.averageScore || 75}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              {editMode ? (
                <textarea
                  value={profileData.personalInfo.bio}
                  onChange={(e) => updatePersonalInfo('bio', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-gray-600">{profileData.personalInfo.bio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              {editMode ? (
                <input
                  type="text"
                  value={profileData.personalInfo.location}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-gray-600">{profileData.personalInfo.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              {editMode ? (
                <input
                  type="text"
                  value={profileData.personalInfo.company}
                  onChange={(e) => updatePersonalInfo('company', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-gray-600">{profileData.personalInfo.company}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              {editMode ? (
                <input
                  type="url"
                  value={profileData.personalInfo.website}
                  onChange={(e) => updatePersonalInfo('website', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <a href={profileData.personalInfo.website} target="_blank" rel="noopener noreferrer" className="mt-1 text-indigo-600 hover:text-indigo-800">
                  {profileData.personalInfo.website}
                </a>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">GitHub</label>
              {editMode ? (
                <input
                  type="url"
                  value={profileData.personalInfo.github}
                  onChange={(e) => updatePersonalInfo('github', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <a href={profileData.personalInfo.github} target="_blank" rel="noopener noreferrer" className="mt-1 text-indigo-600 hover:text-indigo-800">
                  {profileData.personalInfo.github}
                </a>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
              {editMode ? (
                <input
                  type="url"
                  value={profileData.personalInfo.linkedin}
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <a href={profileData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="mt-1 text-indigo-600 hover:text-indigo-800">
                  {profileData.personalInfo.linkedin}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Preferences & Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences & Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Language</label>
              <select
                value={profileData.preferences.preferredLanguage}
                onChange={(e) => updatePreferences('preferredLanguage', e.target.value)}
                disabled={!editMode}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty Preference</label>
              <select
                value={profileData.preferences.difficultyPreference}
                onChange={(e) => updatePreferences('difficultyPreference', e.target.value)}
                disabled={!editMode}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Daily Goal (problems)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={profileData.preferences.dailyGoal}
                onChange={(e) => updatePreferences('dailyGoal', parseInt(e.target.value))}
                disabled={!editMode}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notifications</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profileData.preferences.notifications.email}
                    onChange={(e) => updatePreferences('notifications', { ...profileData.preferences.notifications, email: e.target.checked })}
                    disabled={!editMode}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-600">Email notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profileData.preferences.notifications.push}
                    onChange={(e) => updatePreferences('notifications', { ...profileData.preferences.notifications, push: e.target.checked })}
                    disabled={!editMode}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-600">Push notifications</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 