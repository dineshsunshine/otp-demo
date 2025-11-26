import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { phoneNumber, isTestMode, otp, accessToken } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Use provided token or fallback to hardcoded (for backward compatibility if needed, though user wants to update it)
    const ACCESS_TOKEN = accessToken || 'EAATuIkNZASCwBQBFmEUZCKF1bw1FcZCvdwSBsyaBRZBC66fVvZAkSOPcltinuenc2oFXkunS9fL5pxy97XHgqK6UgOsZCe1g34e3iXZBOtDwBfUZBoTAZAL1sxjFfkkQeq3XiSFuiFu69YbjNqkLLhYhzCZBNYNt8WKmwVrBN45nkqOM9zNFwpEcDgKW7h71eGSxOe0bOBVvi0Y9fvvqLxJrAW4sLJDDvoYNwE70cHUiQOpcLGsXk2MblLU8HJDKZA32xFoy682lhIOPvKcRXJcmuaO';
    const PHONE_NUMBER_ID = '890904030774821';
    const URL = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;

    let payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'template',
      template: {
        name: 'hello_world',
        language: { code: 'en_US' }
      }
    };

    if (!isTestMode) {
      // OTP Mode
      if (!otp) {
        return NextResponse.json({ error: 'OTP is required for authentication mode' }, { status: 400 });
      }
      payload.template.name = 'auth_otp'; // Assumes this template exists
      payload.template.components = [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: otp
            }
          ]
        },
        {
          type: 'button',
          sub_type: 'url',
          index: 0,
          parameters: [
            {
              type: 'text',
              text: otp
            }
          ]
        }
      ];
    }

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'Failed to send message', details: data }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
