import { useState } from 'react';
import { MapPin, FileText, Camera, Users, ArrowRight, Navigation } from 'lucide-react';
import type { IncidentData } from '../../lib/generateIncidentPDF';

interface IncidentFormStepProps {
  data: IncidentData;
  onNext: (data: IncidentData) => void;
}

export default function IncidentFormStep({ data, onNext }: IncidentFormStepProps) {
  const [formData, setFormData] = useState<IncidentData>(data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleInputChange = (field: keyof IncidentData, value: string | 'yes' | 'no' | 'unknown' | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleInputChange('image', e.target.files[0]);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, location: 'Geolocation is not supported by this browser' }));
      return;
    }

    setIsDetectingLocation(true);
    setErrors(prev => ({ ...prev, location: '' }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          // Try multiple geocoding services for better coverage
          let locationDetails = await getDetailedLocation(latitude, longitude);
          
          if (locationDetails) {
            handleInputChange('location', locationDetails);
          } else {
            // Enhanced fallback with coordinates and accuracy
            const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            const accuracyText = accuracy ? ` (±${Math.round(accuracy)}m accuracy)` : '';
            handleInputChange('location', `${coords}${accuracyText}`);
          }
        } catch (error) {
          // Enhanced fallback with coordinates and accuracy
          const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          const accuracyText = accuracy ? ` (±${Math.round(accuracy)}m accuracy)` : '';
          handleInputChange('location', `${coords}${accuracyText}`);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        let errorMessage = 'Unable to detect location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permission.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setErrors(prev => ({ ...prev, location: errorMessage }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  const getDetailedLocation = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      // Try Nominatim (OpenStreetMap) first - it's free and provides good detail
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (nominatimResponse.ok) {
        const data = await nominatimResponse.json();
        
        if (data && data.address) {
          const address = data.address;
          const components = [];
          
          // Build detailed address
          if (address.house_number && address.road) {
            components.push(`${address.house_number} ${address.road}`);
          } else if (address.road) {
            components.push(address.road);
          }
          
          // Add neighborhood or suburb
          if (address.neighbourhood || address.suburb) {
            components.push(address.neighbourhood || address.suburb);
          }
          
          // Add city information
          if (address.city || address.town || address.village) {
            components.push(address.city || address.town || address.village);
          }
          
          // Add state/province
          if (address.state) {
            components.push(address.state);
          }
          
          // Add postal code
          if (address.postcode) {
            components.push(address.postcode);
          }
          
          // Add country
          if (address.country) {
            components.push(address.country);
          }
          
          // Add nearby amenities if available
          let amenityInfo = '';
          if (address.amenity) {
            amenityInfo = ` (Near ${address.amenity})`;
          } else if (address.shop) {
            amenityInfo = ` (Near ${address.shop})`;
          } else if (address.tourism) {
            amenityInfo = ` (Near ${address.tourism})`;
          }
          
          const fullAddress = components.join(', ');
          return fullAddress + amenityInfo;
        }
      }
      
      // Fallback to browser's built-in geocoding if available
      if ('geocoder' in window) {
        // This is a hypothetical browser API that might exist
        // Most browsers don't have this, but we'll try anyway
        return null;
      }
      
      return null;
    } catch (error) {
      console.warn('Geocoding failed:', error);
      return null;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext(formData);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Incident Details</h2>
        <p className="text-gray-600">
          Please provide accurate information about the incident to generate a comprehensive report
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Field */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            Incident Location *
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400 ${
                errors.location 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="Enter the exact location where the incident occurred"
            />
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetectingLocation}
              className={`px-4 py-3 border-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                isDetectingLocation
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 focus:ring-4 focus:ring-blue-100'
              }`}
              title="Detect my current location"
            >
              <Navigation className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isDetectingLocation ? 'Detecting...' : 'Detect'}
              </span>
            </button>
          </div>
          {errors.location && (
            <p className="text-red-500 text-sm flex items-center">
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {errors.location}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Use the detect button to automatically find your current location, or enter the address manually
          </p>
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
            <FileText className="w-4 h-4 mr-2 text-gray-500" />
            Incident Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400 resize-none ${
              errors.description 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500'
            }`}
            placeholder="Provide a detailed description of what happened, including time, weather conditions, and any other relevant details"
          />
          {errors.description && (
            <p className="text-red-500 text-sm flex items-center">
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {errors.description}
            </p>
          )}
          <div className="text-right text-xs text-gray-500">
            {formData.description.length}/500 characters
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
            <Camera className="w-4 h-4 mr-2 text-gray-500" />
            Evidence Photo (Optional)
          </label>
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              {formData.image ? (
                <div className="flex items-center justify-center space-x-2">
                  <Camera className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    {formData.image.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(formData.image.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <div>
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Elderly Involvement */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            Elderly Person Involved?
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="radio"
                  checked={formData.isElderlyInvolved === 'yes'}
                  onChange={() => handleInputChange('isElderlyInvolved', 'yes')}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  formData.isElderlyInvolved === 'yes'
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {formData.isElderlyInvolved === 'yes' && (
                    <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-700 font-medium">Yes</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="radio"
                  checked={formData.isElderlyInvolved === 'no'}
                  onChange={() => handleInputChange('isElderlyInvolved', 'no')}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  formData.isElderlyInvolved === 'no'
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {formData.isElderlyInvolved === 'no' && (
                    <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-700 font-medium">No</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="radio"
                  checked={formData.isElderlyInvolved === 'unknown'}
                  onChange={() => handleInputChange('isElderlyInvolved', 'unknown')}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  formData.isElderlyInvolved === 'unknown'
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {formData.isElderlyInvolved === 'unknown' && (
                    <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  )}
                </div>
              </div>
              <span className="text-gray-700 font-medium">Don't Know</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-blue-300 flex items-center justify-center space-x-2"
          >
            <span>Continue to PDF Generation</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}