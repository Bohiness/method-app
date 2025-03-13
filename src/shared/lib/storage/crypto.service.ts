// src/shared/lib/storage/crypto.service.ts
import { Buffer } from 'buffer'
import * as Crypto from 'expo-crypto'; // Изменим импорт

// Создаем секретный ключ для шифрования
const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_ENCRYPTION_KEY || 'your-fallback-encryption-key'

// Функция шифрования
export async function encrypt(text: string): Promise<string> {
  try {
    // Генерируем случайный IV (Initialization Vector)
    const iv = await Crypto.getRandomBytes(16)
    
    // Создаем ключ на основе нашего секретного ключа
    const key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      ENCRYPTION_KEY
    )
    
    // Шифруем данные
    const textBuffer = Buffer.from(text, 'utf8')
    const keyBuffer = Buffer.from(key, 'hex')
    
    // В реальном приложении здесь бы использовался более сложный алгоритм шифрования
    const encrypted = textBuffer.map((byte, i) => 
      byte ^ keyBuffer[i % keyBuffer.length] ^ iv[i % iv.length]
    )
    
    // Комбинируем IV и зашифрованные данные
    const result = Buffer.concat([Buffer.from(iv), Buffer.from(encrypted)])
    
    return result.toString('base64')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

// Функция дешифрования
export async function decrypt(encryptedText: string): Promise<string> {
  try {
    // Декодируем base64 строку
    const encrypted = Buffer.from(encryptedText, 'base64')
    
    // Извлекаем IV и зашифрованные данные
    const iv = encrypted.slice(0, 16)
    const data = encrypted.slice(16)
    
    // Получаем ключ
    const key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      ENCRYPTION_KEY
    )
    const keyBuffer = Buffer.from(key, 'hex')
    
    // Дешифруем данные
    const decrypted = data.map((byte, i) => 
      byte ^ keyBuffer[i % keyBuffer.length] ^ iv[i % iv.length]
    )
    
    return Buffer.from(decrypted).toString('utf8')
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}