import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBase: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('AWS_ENDPOINT');
    this.bucket = this.config.get<string>('AWS_BUCKET', 'nhachung');
    this.publicBase =
      this.config.get<string>('AWS_PUBLIC_URL') || `${endpoint}/${this.bucket}`;

    this.s3 = new S3Client({
      region: this.config.get<string>('AWS_REGION', 'us-east-1'),
      endpoint,
      forcePathStyle:
        this.config.get<string>('AWS_S3_FORCE_PATH_STYLE', 'true') === 'true',
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  /** Make sure the bucket exists and objects are publicly readable. */
  private async ensureBucket() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Created bucket "${this.bucket}"`);
      } catch (err) {
        this.logger.warn(`Could not create bucket "${this.bucket}": ${err}`);
        return;
      }
    }
    try {
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      };
      await this.s3.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucket,
          Policy: JSON.stringify(policy),
        }),
      );
    } catch (err) {
      this.logger.warn(`Could not set public-read policy: ${err}`);
    }
  }

  /** Upload a buffer and return its public URL. */
  async upload(
    buffer: Buffer,
    opts: { folder?: string; filename: string; contentType?: string },
  ): Promise<{ key: string; url: string }> {
    const safeName = opts.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${opts.folder ? `${opts.folder.replace(/^\/|\/$/g, '')}/` : ''}${nanoid()}-${safeName}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: opts.contentType,
      }),
    );
    return { key, url: this.publicUrl(key) };
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  /** Presigned PUT URL for direct browser uploads. */
  async presignUpload(
    key: string,
    contentType?: string,
    expiresIn = 900,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn });
    return { uploadUrl, key, publicUrl: this.publicUrl(key) };
  }

  publicUrl(key: string): string {
    return `${this.publicBase.replace(/\/$/, '')}/${key}`;
  }
}
