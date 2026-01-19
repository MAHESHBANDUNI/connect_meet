'use client';

import { X, Calendar, UserPlus, Loader, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

const topicSchema = z
  .string()
  .trim()
  .min(1, "Topic is required")
  .max(100, "Topic must be less than 100 characters");

const descriptionSchema = z
  .string()
  .optional()
  .transform(val => val || "");

const dateSchema = z
  .date()
  .refine((date) => date > new Date(), "Meeting date must be in the future");

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address");

const meetingSchema = z.object({
  topic: topicSchema,
  description: descriptionSchema,
  date: dateSchema,
  coHosts: z.array(emailSchema).max(5, "Maximum 5 co-hosts allowed"),
  invitees: z.array(emailSchema).max(20, "Maximum 20 invitees allowed"),
});

export type MeetingFormData = z.infer<typeof meetingSchema>;

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MeetingFormData) => Promise<void>;
  saving: boolean;
  setSaving: (saving: boolean) => void;
}

const ScheduleMeetingModal = ({ 
  isOpen, 
  onClose, 
  onSubmit
}: ScheduleMeetingModalProps) => {
  const [formData, setFormData] = useState<MeetingFormData>({
    topic: '',
    description: '',
    date: new Date(),
    coHosts: [],
    invitees: [],
  });

  const [saving, setSaving] = useState(false);

  const [emailInputs, setEmailInputs] = useState({
    coHost: '',
    invitee: '',
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Element;
      const isInsideModal = target.closest('.modal-content');
      const isInsidePopover = target.closest('[data-slot="popover-content"]') || 
                              target.closest('[data-slot="popover-trigger"]');
      
      if (!isInsideModal && !isInsidePopover) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  const handleClose = () => {
    setFormData({
      topic: '',
      description: '',
      date: new Date(),
      coHosts: [],
      invitees: [],
    });
    setEmailInputs({
      coHost: '',
      invitee: '',
    });
    setErrors({});
    setTouched({});
    onClose();
  };

  const handleChange = (field: keyof MeetingFormData, value: any) => {
    const updatedForm = { ...formData, [field]: value };
    setFormData(updatedForm);

    setTouched(prev => ({ ...prev, [field]: true }));

    try {
      const fieldSchema = meetingSchema.pick({ [field]: true } as Record<keyof MeetingFormData, true>);
      fieldSchema.parse({ [field]: value });
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        const issue = err.issues?.[0]?.message || "Invalid value";
        setErrors(prev => ({ ...prev, [field]: issue }));
      }
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      handleChange('date', date);
    }
  };

  const addEmail = (type: 'coHost' | 'invitee', email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    try {
      emailSchema.parse(trimmedEmail);

      const field = type === 'coHost' ? 'coHosts' : 'invitees';
      if (formData[field].includes(trimmedEmail)) {
        setErrors(prev => ({ 
          ...prev, 
          [field]: `${type === 'coHost' ? 'Co-host' : 'Invitee'} already added` 
        }));
        return;
      }

      const updatedArray = [...formData[field], trimmedEmail];
      handleChange(field, updatedArray);
      setEmailInputs(prev => ({ ...prev, [type]: '' }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (err) {
      const field = type === 'coHost' ? 'coHosts' : 'invitees';
      setErrors(prev => ({ 
        ...prev, 
        [field]: type === 'coHost' ? 'Invalid co-host email' : 'Invalid invitee email' 
      }));
    }
  };

  const removeEmail = (type: 'coHosts' | 'invitees', email: string) => {
    const updatedArray = formData[type].filter(e => e !== email);
    handleChange(type, updatedArray);
  };

  const validateForm = () => {
    try {
      meetingSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formatted: Record<string, string> = {};
        err.issues.forEach(error => {
          formatted[String(error.path[0])] = error.message;
        });
        setErrors(formatted);
      }
      return false;
    }
  };

  const isFormValid = () => {
    try {
      meetingSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!validateForm()) {
      setSaving(false);
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      setErrors(prev => ({ 
        ...prev, 
        submit: "Failed to schedule meeting. Please try again." 
      }));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center p-4 bg-[#00000082] backdrop-blur-[5px] z-9999">
      <div className="modal-content bg-white rounded-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 p-4 bg-linear-to-r from-green-600 to-green-700">
          <h2 className="text-xl text-white font-semibold">Schedule Meeting</h2>
          <button 
            onClick={handleClose} 
            className="text-white p-1 hover:bg-green-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Topic */}
          <div>
            <Label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Topic*
            </Label>
            <Input
              id="topic"
              value={formData.topic}
              disabled={saving}
              onChange={(e) => handleChange('topic', e.target.value)}
              className={`w-full ${touched.topic && errors.topic ? "border-red-500" : ""}`}
              placeholder="Meeting about project planning"
            />
            {touched.topic && errors.topic && (
              <p className="text-red-500 text-xs mt-1">{errors.topic}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              disabled={saving}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full min-h-25"
              placeholder="Add meeting agenda, discussion points, etc."
            />
          </div>

          {/* Date and Time */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time*
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={saving}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground",
                    touched.date && errors.date && "border-red-500"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    format(formData.date, "PPP 'at' hh:mm a")
                  ) : (
                    <span>Pick a date and time</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.date}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Label htmlFor="time" className="text-sm font-medium mb-2 block">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.date ? format(formData.date, 'HH:mm') : ''}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(formData.date);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      handleChange('date', newDate);
                    }}
                    className="w-full"
                  />
                </div>
              </PopoverContent>
            </Popover>
            {touched.date && errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          {/* Co-hosts */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Add Co-hosts
            </Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={emailInputs.coHost}
                  disabled={saving}
                  onChange={(e) => {
                    setEmailInputs(prev => ({ ...prev, coHost: e.target.value }));
                    setErrors(prev => ({ ...prev, coHosts: undefined }));
                  }}
                  placeholder="co-host@example.com"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => addEmail('coHost', emailInputs.coHost)}
                  disabled={saving || !emailInputs.coHost}
                  size="sm"
                  variant="secondary"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.coHosts.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.coHosts.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <button
                        type="button"
                        onClick={() => removeEmail('coHosts', email)}
                        disabled={saving}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {errors.coHosts && (
                <p className="text-red-500 text-xs mt-1">{errors.coHosts}</p>
              )}
            </div>
          </div>

          {/* Invitees */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Add Invitees
            </Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={emailInputs.invitee}
                  disabled={saving}
                  onChange={(e) => {
                    setEmailInputs(prev => ({ ...prev, invitee: e.target.value }));
                    setErrors(prev => ({ ...prev, invitees: undefined }));
                  }}
                  placeholder="invitee@example.com"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => addEmail('invitee', emailInputs.invitee)}
                  disabled={saving || !emailInputs.invitee}
                  size="sm"
                  variant="secondary"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.invitees.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.invitees.map((email) => (
                    <Badge key={email} variant="outline" className="flex items-center gap-1">
                      {email}
                      <button
                        type="button"
                        onClick={() => removeEmail('invitees', email)}
                        disabled={saving}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {errors.invitees && (
                <p className="text-red-500 text-xs mt-1">{errors.invitees}</p>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              disabled={saving}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={!isFormValid() || saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Schedule Meeting
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;