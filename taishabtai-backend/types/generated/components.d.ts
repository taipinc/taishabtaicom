import type { Schema, Struct } from '@strapi/strapi';

export interface ImageImageBlock extends Struct.ComponentSchema {
  collectionName: 'components_image_image_blocks';
  info: {
    displayName: 'Image Block';
    icon: 'landscape';
  };
  attributes: {
    caption: Schema.Attribute.String;
    enableFullscreen: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    image: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface ImageImageGallery extends Struct.ComponentSchema {
  collectionName: 'components_image_image_galleries';
  info: {
    displayName: 'Image Gallery';
  };
  attributes: {
    caption: Schema.Attribute.String;
    enableFullscreen: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    gutter: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<8>;
    images: Schema.Attribute.Media<'images' | 'files', true>;
    layout: Schema.Attribute.Enumeration<['justify', 'grid', 'masonry']> &
      Schema.Attribute.DefaultTo<'justify'>;
    rows: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<3>;
  };
}

export interface TextBigText extends Struct.ComponentSchema {
  collectionName: 'components_text_big_texts';
  info: {
    displayName: 'Big Text';
  };
  attributes: {
    text: Schema.Attribute.Blocks;
  };
}

export interface TextTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_text_text_blocks';
  info: {
    displayName: 'Text Block';
    icon: 'stack';
  };
  attributes: {
    text: Schema.Attribute.Blocks;
  };
}

export interface TextTwoColumns extends Struct.ComponentSchema {
  collectionName: 'components_text_two_columns';
  info: {
    displayName: 'Two Columns';
  };
  attributes: {
    text: Schema.Attribute.Blocks;
  };
}

export interface VideoVideoEmbed extends Struct.ComponentSchema {
  collectionName: 'components_video_video_embeds';
  info: {
    displayName: 'Video Embed';
  };
  attributes: {
    caption: Schema.Attribute.String;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'image.image-block': ImageImageBlock;
      'image.image-gallery': ImageImageGallery;
      'text.big-text': TextBigText;
      'text.text-block': TextTextBlock;
      'text.two-columns': TextTwoColumns;
      'video.video-embed': VideoVideoEmbed;
    }
  }
}
